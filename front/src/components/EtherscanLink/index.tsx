import React from "react";

interface LinkProps {
    href: string;
    children: React.ReactNode;
}

function Link({ href, children }: LinkProps) {
    return (
        <a className="text-primary" onClick={() => window.open(href, "_blank")}>
            {children}
        </a>
    );
}

interface ContractLinkProps {
    contract: string;
}

function ContractLink({ contract }: ContractLinkProps): JSX.Element {
    const href = `https://goerli.etherscan.io/address/${contract}`;
    return <Link href={href}>{contract}</Link>;
}

interface TransactionLinkProps {
    transactionHash: string;
}

function TransactionLink({
    transactionHash,
}: TransactionLinkProps): JSX.Element {
    const href = `https://goerli.etherscan.io/tx/${transactionHash}`;
    return <Link href={href}>{transactionHash}</Link>;
}

export const EtherscanLink = {
    Contract: ContractLink,
    Transaction: TransactionLink,
};