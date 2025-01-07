import { SessionStorageKeys } from "@/interface/SessionStorageKeys";

export function setItemToStorage(actionKey: SessionStorageKeys, item: string) {
  localStorage.setItem(actionKey, item);
}
