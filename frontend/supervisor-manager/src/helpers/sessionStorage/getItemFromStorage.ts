import { SessionStorageKeys } from "@/interface/SessionStorageKeys";

export function getItemFromStorage<Type>(itemKey: SessionStorageKeys) {
    if (typeof localStorage === 'undefined') {
       return;
    }

    const itemFromStorage = localStorage.getItem(itemKey as string);
    return itemFromStorage ? (itemFromStorage as unknown as Type) : null;
}
