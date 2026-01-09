import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Metaplex,
  irysStorage,
  keypairIdentity,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { createMint } from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import { readFileSync } from "fs";
import path from "path";
import { SplWithMetadata } from "../target/types/spl_with_metadata";
import { min } from "bn.js";

describe("spl_with_metadata", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.splWithMetadata as Program<SplWithMetadata>;

  const wallet = provider.wallet as anchor.Wallet;
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const metaplex = Metaplex.make(provider.connection)
    .use(keypairIdentity(wallet.payer))
    .use(
      irysStorage({
        address: "https://devnet.irys.xyz",
        providerUrl: provider.connection.rpcEndpoint,
        timeout: 60_000,
      })
    );

  it("creates token with metadata", async () => {
    // create the mint
    const mintKeypair = Keypair.generate();
    await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      9,
      mintKeypair
    );

    const mintPubkey = mintKeypair.publicKey;
    console.log("Mint pubkey", mintPubkey.toBase58());

    // read and convert our image into a Metaplex file
    const imageBuffer = readFileSync(
      path.resolve(__dirname, "../assets/image/x.jpeg")
    );

    const metaplexFile = toMetaplexFile(imageBuffer, "x.jpeg");

    // upload image, get arweave URI string
    const arweaveImageUri = await metaplex.storage().upload(metaplexFile);
    const imageTxId = arweaveImageUri.split("/").pop()!;
    const imageUri = `https://devnet.irys.xyz/${imageTxId}`;
    console.log("Devnet Irys image URL:", imageUri);

    const metadata = {
      name: "Mercy dapps Token",
      symbol: "Mdapps",
      description: "This is a token by Mercy dapps",
      image: imageUri,
    };

    // upload JSON, get arweave URI string
    const arweaveMetadataUri = await metaplex.storage().uploadJson(metadata);

    const metadataTxId = arweaveMetadataUri.split("/").pop()!;
    const metadataUri = `https://devnet.irys.xyz/${metadataTxId}`;
    console.log("Devnet Irys metadata URL:", metadataUri);

    // derive on-chain metadata PDA
    const [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    console.log("Metadata PDA:", metadataPda.toBase58());

    // call the create_token_metadata function
    const tx = await program.methods
      .createTokenMetadata(
        metadata.name,
        metadata.symbol,
        metadataUri,
        100,
        true
      )
      .accountsPartial({
        metadata: metadataPda,
        mint: mintPubkey,
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .rpc();

    console.log("Transaction signature:", tx);

    // assert the account exists and is owned by the Metadata program
    const info = await provider.connection.getAccountInfo(metadataPda);
    assert(info !== null, "Metadata account must exist");
    assert(
      info.owner.equals(TOKEN_METADATA_PROGRAM_ID),
      "Wrong owner for metadata account"
    );
  });
});
