import { BigNumber, Contract, providers, utils } from 'ethers';
import { Web3Provider, JsonRpcSigner } from "@ethersproject/providers";
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';
import Web3Modal from "web3modal";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from "../constants";

export default function Home() {
	const zero = BigNumber.from(0);

	const [walletConnected, setWalletConncted] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const [tokensToBeClaimed, setTokensToBeClaimed] = useState<BigNumber>(zero);
	const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] = useState<BigNumber>(zero);

	const [tokenAmount, setTokenAmount] = useState<BigNumber>(zero);

	const [tokensMinted, setTokensMinted] = useState<BigNumber>(zero);
	const [balanceOfEtherInContract, setBalanceOfEtherInContract] = useState<BigNumber>(zero);

	const [isOwner, setIsOwner] = useState<boolean>(false);

	const web3Modal = useRef<Web3Modal>();

	async function getProviderOrSigner(isSigner: boolean = false): Promise<Web3Provider | JsonRpcSigner> {
		const provider = await web3Modal.current?.connect();
		const web3Provider = new providers.Web3Provider(provider);
		if (isSigner) {
			const signer = web3Provider.getSigner();
			return signer;
		}
		return web3Provider;
	}

	async function getTokensToBeClaimed() {
		try {
			const provider = await getProviderOrSigner();
			const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
			const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);

			const signer = await getProviderOrSigner(true) as JsonRpcSigner;
			const address = await signer.getAddress();
			const balance = await nftContract.balanceOf(address);

			if (balance === zero) {
				setTokenAmount(zero);
			} else {
				let amount = 0;
				for (let i = 0; i < balance; i++) {
					const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
					const claimed = await tokenContract.tokenIdsClaimed(tokenId);
					if (!claimed) {
						amount++;
					}
				}
				setTokensToBeClaimed(BigNumber.from(amount));
			}
		} catch (e) {
			console.error(e);
			setTokensToBeClaimed(zero);
		}
	}

	async function getBalanceOfCryptoDevTokens() {
		try {
			const provider = await getProviderOrSigner();
			const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);
			const signer = await getProviderOrSigner(true) as JsonRpcSigner;
			const address = await signer.getAddress();
			const balance = await tokenContract.balanceOf(address);
			setBalanceOfCryptoDevTokens(balance);
		} catch (e) {
			console.error(e);
			setBalanceOfCryptoDevTokens(zero);
		}
	}

	async function getTotalTokensMinted() {
		try {
			const provider = await getProviderOrSigner();
			const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);
			const _tokensMinted = await tokenContract.totalSupply();
			setTokensMinted(_tokensMinted);
		} catch (e) {
			console.error(e);
			// setTokensMinted(zero);
		}

	}

	async function mintCryptoDevTokens(amount: number) {
		try {
			const signer = await getProviderOrSigner(true);
			const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);
			const value = 0.001 * amount;
			const tx = await tokenContract.mint(amount, { value: utils.parseEther(value.toString()) });
			setLoading(true);
			await tx.wait();
			setLoading(false);
			window.alert("Sucessfully minted Crypto Dev Tokens");
			await getTokensToBeClaimed();
			await getBalanceOfCryptoDevTokens();
			await getTotalTokensMinted();
		} catch (e) {
			console.error(e);
		}
	}

	async function claimCryptoDevsTokens() {
		try {
			const signer = await getProviderOrSigner(true);
			const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);
			const tx = await tokenContract.claim();
			setLoading(true);
			await tx.wait();
			setLoading(false);
			window.alert("Sucessfully claimed Crypto Dev Tokens");
			await getBalanceOfCryptoDevTokens();
			await getTokensToBeClaimed();
			await getTotalTokensMinted();
		} catch (e) {
			console.error(e);
		}
	}

	async function getOwner() {
		try {
			const provider = await getProviderOrSigner();
			const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);
			const owner = await tokenContract.owner() as string;
			const signer = await getProviderOrSigner(true) as JsonRpcSigner;
			const address = await signer.getAddress();
			if (address.toLocaleLowerCase() === owner.toLocaleLowerCase()) {
				setIsOwner(true);
			}
		} catch (error) {
			console.error(error);
		}
	}

	async function getBalanceETH() {
		try {
			const provider = await getProviderOrSigner();
			const balance = await provider.getBalance(TOKEN_CONTRACT_ADDRESS);
			setBalanceOfEtherInContract(balance);
		} catch (e) {
			console.error(e);
			setBalanceOfEtherInContract(zero);
		}
	}

	async function withdrawCoins() {
		try {
			const signer = await getProviderOrSigner(true);
			const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);
			const tx = await tokenContract.withdraw();
			setLoading(true);
			await tx.wait();
			setLoading(false);
			await getOwner();
		} catch (e) {
			console.error(e);
		}
	}

	async function connectWallet() {
		try {
			await getProviderOrSigner();
			setWalletConncted(true);
		} catch (e) {
			console.error(e);
		}
	}

	useEffect(() => {
		if (!walletConnected) {
			web3Modal.current = new Web3Modal({
				network: "goerli",
				providerOptions: {},
				disableInjectedProvider: false,
			});
			connectWallet();
			getTokensToBeClaimed();
			getBalanceOfCryptoDevTokens();
			getTotalTokensMinted();
			getBalanceETH();
			getOwner();
		}
	}, [walletConnected]);

	function renderButton() {
		if (loading) {
			return (
				<div>
					<button className={styles.button}>Loading...</button>
				</div>
			);
		}
		if (walletConnected && isOwner && balanceOfEtherInContract.gt(0)) {
			return (
				<div>
					<button onClick={withdrawCoins} className={styles.button1}>Withdraw Coins</button>
				</div>
			)
		}
		if (tokensToBeClaimed.gt(0)) {
			return (
				<div>
					<div className={styles.description}>
						{tokensToBeClaimed.toNumber() * 10} Tokens can be claimed!
					</div>
					<button className={styles.button} onClick={claimCryptoDevsTokens}>
						Claim Tokens
					</button>
				</div>
			)
		}
		return (
			<div style={{ display: "flex-col" }}>
				<div>
					<input
						type="number"
						placeholder='Amount Of Tokens'
						onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
						className={styles.input}
					/>
				</div>
				<button
					className={styles.button}
					disabled={!(tokenAmount.gt(0))}
					onClick={() => mintCryptoDevTokens(tokenAmount.toNumber())}
				>
					Mint Tokens
				</button>
			</div>
		);
	}

	return (
		<div>
			<Head>
				<title>Crypto Devs</title>
				<meta name="description" content="ICO-app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className={styles.main}>
				<div>
					<h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
					<div className={styles.description}>
						You can claim or mint Crypto Dev token here.
					</div>
					{walletConnected ? (
						<div>
							<div className={styles.description}>
								You have minted {utils.formatEther(balanceOfCryptoDevTokens)} Crypto Dev Tokens
							</div>
							<div className={styles.description}>
								Overall {utils.formatEther(tokensMinted)}/10000 have been minted!
							</div>
							{renderButton()}
						</div>
					) : (
						<button onClick={connectWallet} className={styles.button}>
							Connect your wallet
						</button>
					)}
				</div>
				<div>
					<img src="./0.svg" className={styles.image} />
				</div>
			</div>

			<footer className={styles.footer}>
				Made with &#10084; by Crypto Devs
			</footer>
		</div>
	)
}
