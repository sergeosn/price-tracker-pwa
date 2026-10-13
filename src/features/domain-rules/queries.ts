import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unwrap } from "../../api/client";
import type { DomainRuleCreate, DomainRuleUpdate } from "../../api/types";
import { productKeys } from "../products/queries";
import { useApi } from "../settings/context";

/** Shops are few; one page of the API maximum is enough. */
export const DOMAIN_RULES_LIMIT = 200;

export const domainRuleKeys = {
  all: ["domain-rules"] as const,
  list: () => [...domainRuleKeys.all, "list"] as const,
};

export function useDomainRules() {
  const api = useApi();
  return useQuery({
    queryKey: domainRuleKeys.list(),
    queryFn: () =>
      unwrap(api.GET("/api/v1/domain-rules", { params: { query: { limit: DOMAIN_RULES_LIMIT } } })),
  });
}

/** A rule sets the shop currency, which every product of that shop displays. */
function useInvalidateAfterRuleChange() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: domainRuleKeys.all });
    void queryClient.invalidateQueries({ queryKey: productKeys.all });
  };
}

export function useCreateDomainRule() {
  const api = useApi();
  const invalidate = useInvalidateAfterRuleChange();
  return useMutation({
    mutationFn: (body: DomainRuleCreate) => unwrap(api.POST("/api/v1/domain-rules", { body })),
    onSuccess: invalidate,
  });
}

export function useUpdateDomainRule() {
  const api = useApi();
  const invalidate = useInvalidateAfterRuleChange();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: DomainRuleUpdate }) =>
      unwrap(
        api.PATCH("/api/v1/domain-rules/{rule_id}", { params: { path: { rule_id: id } }, body }),
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteDomainRule() {
  const api = useApi();
  const invalidate = useInvalidateAfterRuleChange();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap(api.DELETE("/api/v1/domain-rules/{rule_id}", { params: { path: { rule_id: id } } })),
    onSuccess: invalidate,
  });
}
