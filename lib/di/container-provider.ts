import { db } from "@/lib/db/drizzle";
import { DIContainer, createContainer } from "./container";

let container: DIContainer | null = null;

export function getContainer(): DIContainer {
  if (!container) {
    container = createContainer(db);
  }
  return container;
}
