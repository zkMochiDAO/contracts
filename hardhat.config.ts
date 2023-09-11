import '@matterlabs/hardhat-zksync-deploy';
import '@matterlabs/hardhat-zksync-solc';
import "@matterlabs/hardhat-zksync-verify";

import { HardhatUserConfig } from 'hardhat/config';

const config: HardhatUserConfig = {
    zksolc: {
        compilerSource: 'binary',
        settings: {
            isSystem: true,
            optimizer: {
                enabled: true,
            },
        }
    },
    defaultNetwork: 'hardhat',
    networks: {
      hardhat: {
          zksync: true
      },
      zkSyncTestnet: {
          url: 'https://zksync2-testnet.zksync.dev',
          ethNetwork: 'goerli',
          zksync: true,
          verifyURL: 'https://zksync2-testnet-explorer.zksync.dev/contract_verification'
      },
      zkSyncMainnet: {
          url: 'https://mainnet.era.zksync.io',
          ethNetwork: 'mainnet',
          zksync: true,
          verifyURL: 'https://zksync2-mainnet-explorer.zksync.dev/contract_verification'
      }
    },
    // Docker image only works for solidity ^0.8.0.
    // For earlier versions you need to use binary releases of zksolc.
    solidity: {
        version: '0.8.17',
    },
};

export default config;