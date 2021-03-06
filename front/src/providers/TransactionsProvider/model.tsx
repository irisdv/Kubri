import { AddTransactionResponse, Status, TransactionStatus } from "starknet";

export interface StoredTransaction {
  code: TransactionStatus | Status;
  hash: string;
  address?: string;
  lastChecked: string;
}

export type StoredTransactionsState = StoredTransaction[];

export interface TransactionsProviderState {
  transactions: StoredTransactionsState;
  addTransaction: (tx: AddTransactionResponse) => void;
}

export const TRANSACTIONS_PROVIDER_INITIAL_STATE: TransactionsProviderState = {
  transactions: [],
  addTransaction: (_tx) => undefined,
};
