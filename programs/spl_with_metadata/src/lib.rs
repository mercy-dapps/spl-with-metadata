use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;

pub use error::*;
pub use instructions::*;

declare_id!("8uYYGzstnn6FiyJBkic5DW5punwghAAH8MV5yJ1V9nVH");

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
