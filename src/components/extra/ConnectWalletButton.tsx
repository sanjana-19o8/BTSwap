import {ConnectButton} from '@rainbow-me/rainbowkit';
import { memo, useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useAccount, useConnect } from 'wagmi';

const ConnectWalletButton = () => {
    const { connector } = useAccount();
    const { connect } = useConnect();
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [addresses, setAddresses] = useState<string[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const fetchAddresses = async () => {
        if (connector) {
            const provider = await connector.getProvider();
            const accounts = await provider.request({ method: 'eth_accounts' });
            setAddresses(accounts);
            if (!selectedAddress && accounts.length > 0) {
                setSelectedAddress(accounts[0]);
            }
        }
    };

    useEffect(() => {
        if (dropdownOpen) {
            fetchAddresses();
        }
    }, [dropdownOpen]);

    return (
        <ConnectButton.Custom>
            {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
              }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');
                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button className="btn text-white w-32 bg-custom-red border-transparent"
                                            onClick={openConnectModal} type="button">
                                            <span>
                                                Connect
                                            </span>
                                    </button>
                                );
                            }
                            if (chain.unsupported) {
                                return (
                                    <button className="btn mx-0 text-white w-48 font-bolder border-transparent"
                                            onClick={openChainModal} type="button">
                                            <span>
                                                Wrong network
                                            </span>
                                    </button>
                                );
                            }
                            return (
                                <div style={{display: 'flex', gap: 12}}>
                                    <button
                                        onClick={openChainModal}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(96, 122, 227, 0.15)',
                                            borderRadius: '12px'
                                        }}
                                        className="btn mx-0 text-white w-fit font-bolder border-transparent"
                                        type="button"
                                    >
                                        {chain.hasIcon && (
                                            <div
                                                style={{
                                                    background: chain.iconBackground,
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: 999,
                                                    overflow: 'hidden',
                                                    marginLeft: '7px'
                                                }}
                                            >
                                                {chain.iconUrl && (
                                                    <Image
                                                        alt={chain.name ?? 'Chain icon'}
                                                        src={chain.iconUrl}
                                                        width={20}
                                                        height={20}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        <span>
                                        {/*{chain.name}*/}
                                            </span>
                                    </button>

                                    <div style={{ position: 'relative', borderRadius: '12px', border: '1px solid #D90429', paddingRight: '10px', display: 'flex' }}>
                                        <button
                                            onClick={() => {
                                                openAccountModal(); // Open modal
                                            }}
                                            className="btn bg-transparent border-transparent mx-0 text-white w-48 font-bolder flex items-center justify-between"
                                        >
                                            <span>
                                                {selectedAddress ? `${selectedAddress.slice(0, 6)}...${selectedAddress.slice(-4)}` : account.displayName}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(!dropdownOpen); // Toggle dropdown
                                            }}
                                            className={`ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                                            ▼
                                        </button>

                                        {dropdownOpen && addresses.length > 1 && (
                                            <div className="absolute top-full left-0 w-full bg-gray-800 rounded-lg mt-1 shadow-md z-10">
                                                {addresses.map((addr) => {
                                                    if(addr != selectedAddress)
                                                        return (
                                                            <button
                                                            key={addr}
                                                            className="block text-white w-full text-left px-4 py-2 hover:bg-gray-700"
                                                            onClick={() => {
                                                                setSelectedAddress(addr);
                                                                setDropdownOpen(false);
                                                            }}
                                                        >
                                                            {addr.slice(0, 6)}...{addr.slice(-4)}
                                                        </button>)
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};

export default dynamic(Promise.resolve(memo(ConnectWalletButton)), {ssr: false});