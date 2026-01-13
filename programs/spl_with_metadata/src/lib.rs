use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;

pub use error::*;
pub use instructions::*;

declare_id!("DPdXymaxb5YS8br93TSSSpiAdj1UytCdf1axrkqPe67k");

#[program]
pub mod spl_with_metadata {
    use super::*;

    pub fn create_token_metadata(
        ctx: Context<CreateTokenMetadata>,
        name: String,
        symbol: String,
        uri: String,
        seller_fee_basis_points: u16,
        is_mutable: bool
    ) -> Result<()> {
       ctx.accounts.create_token_metadata(
        name, 
        symbol, 
        uri, 
        seller_fee_basis_points, 
        is_mutable
    )?;

       Ok(())
    }
}
