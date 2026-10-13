import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unwrap } from "../../api/client";
import type { Product, ProductCreate, ProductUpdate } from "../../api/types";
import { useApi } from "../settings/context";

export type ProductFilter = "all" | "errors" | "paused";

export const PRODUCTS_PAGE_SIZE = 50;
/** The API's maximum page size; the chart shows at most this many changes. */
export const HISTORY_LIMIT = 200;

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filter: ProductFilter) => [...productKeys.lists(), filter] as const,
  detail: (id: number) => [...productKeys.all, "detail", id] as const,
  history: (id: number) => [...productKeys.all, "history", id] as const,
};

function filterQuery(filter: ProductFilter): { status?: "error"; is_active?: boolean } {
  switch (filter) {
    case "all":
      return {};
    case "errors":
      return { status: "error" };
    case "paused":
      return { is_active: false };
  }
}

export function useProducts(filter: ProductFilter) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: productKeys.list(filter),
    queryFn: ({ pageParam }) =>
      unwrap(
        api.GET("/api/v1/products", {
          params: {
            query: { ...filterQuery(filter), limit: PRODUCTS_PAGE_SIZE, offset: pageParam },
          },
        }),
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const next = lastPage.offset + lastPage.items.length;
      return next < lastPage.total ? next : undefined;
    },
  });
}

export function useProduct(id: number) {
  const api = useApi();
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () =>
      unwrap(api.GET("/api/v1/products/{product_id}", { params: { path: { product_id: id } } })),
  });
}

export function useProductHistory(id: number) {
  const api = useApi();
  return useQuery({
    queryKey: productKeys.history(id),
    queryFn: () =>
      unwrap(
        api.GET("/api/v1/products/{product_id}/history", {
          params: { path: { product_id: id }, query: { limit: HISTORY_LIMIT } },
        }),
      ),
  });
}

export function useCreateProduct() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ProductCreate) => unwrap(api.POST("/api/v1/products", { body })),
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.detail(product.id), product);
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUpdateProduct(id: number) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ProductUpdate) =>
      unwrap(
        api.PATCH("/api/v1/products/{product_id}", { params: { path: { product_id: id } }, body }),
      ),
    onSuccess: (product, body) => {
      queryClient.setQueryData(productKeys.detail(id), product);
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // A new selector makes the backend re-check the price, which may add history.
      if ("price_selector" in body) {
        void queryClient.invalidateQueries({ queryKey: productKeys.history(id) });
      }
    },
  });
}

export function useDeleteProduct() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap(api.DELETE("/api/v1/products/{product_id}", { params: { path: { product_id: id } } })),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      queryClient.removeQueries({ queryKey: productKeys.history(id) });
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useCheckProduct(id: number) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      unwrap(
        api.POST("/api/v1/products/{product_id}/check", { params: { path: { product_id: id } } }),
      ),
    onSuccess: ({ result, product }) => {
      queryClient.setQueryData<Product>(productKeys.detail(id), product);
      // Status and "last checked" change on every check, so lists are always stale.
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      if (result.changed) {
        void queryClient.invalidateQueries({ queryKey: productKeys.history(id) });
      }
    },
  });
}
