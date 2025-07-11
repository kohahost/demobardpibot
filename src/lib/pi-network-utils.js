import { Server, Keypair, Asset, TransactionBuilder, Operation } from '@stellar/stellar-sdk';
import { mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';

const PI_NETWORK_PASSPHRASE = "Pi Network";
const HORIZON_SERVER_URL = "https://api.mainnet.minepi.com";

const horizonServers = Array(50).fill().map(() => new Server(HORIZON_SERVER_URL, { allowHttp: true }));
const getRandomServer = () => horizonServers[Math.floor(Math.random() * horizonServers.length)];

export function createKeypairFromMnemonic(mnemonic) {
    const seed = mnemonicToSeedSync(mnemonic);
    const derivedSeed = derivePath("m/44'/314159'/0'", seed);
    return Keypair.fromRawEd25519Seed(derivedSeed.key);
}

async function fetchClaimableBalances(publicKey) {
    const { records } = await getRandomServer().claimableBalances().claimant(publicKey).limit(10).call();
    return records;
}

export async function getLockedBalances(keyphrase) {
    try {
        const keypair = createKeypairFromMnemonic(keyphrase);
        const publicKey = keypair.publicKey();
        const claimableRecords = await fetchClaimableBalances(publicKey);
        const balances = claimableRecords.map(record => ({
            id: record.id,
            amount: record.amount,
            asset: "PI",
        }));
        return { balances, publicKey };
    } catch (error) {
        console.error("Error saat mengambil saldo terkunci:", error);
        throw error;
    }
}

async function sponsoredClaimAndTransfer(sponsorKeypair, sourceKeypair, recipientAddress, claimableBalanceId) {
    try {
        const sponsorPublicKey = sponsorKeypair.publicKey();
        const sourcePublicKey = sourceKeypair.publicKey();
        const sponsorAccount = await getRandomServer().loadAccount(sponsorPublicKey);
        const balanceToClaim = await getRandomServer().claimableBalances().claimableBalance(claimableBalanceId).call();
        const asset = balanceToClaim.asset === 'native' ? Asset.native() : new Asset(...balanceToClaim.asset.split(':'));
        
        await getRandomServer().loadAccount(recipientAddress);

        const baseFee = await getRandomServer().fetchBaseFee();
        let transaction = new TransactionBuilder(sponsorAccount, { fee: baseFee, networkPassphrase: PI_NETWORK_PASSPHRASE })
            .addOperation(Operation.claimClaimableBalance({ balanceId: claimableBalanceId, source: sourcePublicKey }))
            .addOperation(Operation.payment({ destination: recipientAddress, asset: asset, amount: balanceToClaim.amount, source: sourcePublicKey }))
            .setTimeout(30)
            .build();

        transaction.sign(sponsorKeypair);
        transaction.sign(sourceKeypair);

        const result = await getRandomServer().submitTransaction(transaction);
        return { isSuccess: true, result };
    } catch (error) {
        console.error("Error pada transaksi yang disponsori:", error.message);
        if (error.response?.data?.extras) console.error("Detail Error:", JSON.stringify(error.response.data.extras, null, 2));
        return { isSuccess: false, error };
    }
}

export async function processSponsoredTransfer(sourceKeyphrase, sponsorKeyphrase, recipientAddress, claimableId) {
    const sourceKeypair = createKeypairFromMnemonic(sourceKeyphrase);
    const sponsorKeypair = createKeypairFromMnemonic(sponsorKeyphrase);
    const result = await sponsoredClaimAndTransfer(sponsorKeypair, sourceKeypair, recipientAddress, claimableId);

    return {
        details: {
            senderAddress: sourceKeypair.publicKey(),
            receiverAddress: recipientAddress,
        },
        ...result
    };
}