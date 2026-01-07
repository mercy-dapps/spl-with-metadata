use anchor_lang::prelude::*;

declare_id!("DPdXymaxb5YS8br93TSSSpiAdj1UytCdf1axrkqPe67k");

#[program]
pub mod spl_with_metadata {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
