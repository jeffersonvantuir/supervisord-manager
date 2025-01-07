import { SessionStorageKeys } from "@/interface/SessionStorageKeys";

export function removeItemFromStorage(actionKeys: SessionStorageKeys) {
  localStorage.removeItem(actionKeys);
}
