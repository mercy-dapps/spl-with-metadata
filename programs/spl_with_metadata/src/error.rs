use anchor_lang::prelude::*;

#[error_code]
pub enum MetaplexError {
    #[msg("The provided metadata account does not match the PDA for this mint")]
    InvalidMetadataAccount,
}