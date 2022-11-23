import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NFT_CONTRACT_ADDRESS } from "../constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { deployments, getNamedAccounts, getChainId } = hre;
	const { deploy } = deployments;

	const { deployer } = await getNamedAccounts();

	const cryptoDevs = await deploy("CryptoDevs", {
		from: deployer,
		log: true,
		args: [NFT_CONTRACT_ADDRESS]
	});

	console.log("CryptoDevs Token Address:", cryptoDevs.address);

	const chainId = await getChainId();
	if (chainId !== "31337") {
		await hre.run("verify:verify", {
			address: cryptoDevs.address,
			constructorArguments: [NFT_CONTRACT_ADDRESS],
		})
	}
}

export default func;
func.tags = ["token"]