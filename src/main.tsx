import "@mantine/core/styles.css";
import { MantineProvider, Text } from "@mantine/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <Text p="md">Price Tracker</Text>
    </MantineProvider>
  </StrictMode>,
);
