// Additional view functions that should be added to your smart contract
// Add these to your lib.rs file in the #[public] impl block:

// Get plan details
pub fn get_plan_provider(&self, plan_id: U256) -> Address {
    self.plan_provider.get(plan_id)
}

pub fn get_plan_price(&self, plan_id: U256) -> U256 {
    self.plan_price.get(plan_id)
}

pub fn get_plan_interval(&self, plan_id: U256) -> U256 {
    self.plan_interval.get(plan_id)
}

// Get subscription details
pub fn get_subscription_plan_id(&self, subscription_id: U256) -> U256 {
    self.subscription_plan_id.get(subscription_id)
}

pub fn get_subscription_subscriber(&self, subscription_id: U256) -> Address {
    self.subscription_subscriber.get(subscription_id)
}

pub fn get_subscription_last_payment(&self, subscription_id: U256) -> U256 {
    self.subscription_last_payment.get(subscription_id)
}

pub fn is_subscription_active(&self, subscription_id: U256) -> bool {
    self.subscription_active.get(subscription_id)
}

// Get next plan and subscription IDs
pub fn get_next_plan_id(&self) -> U256 {
    self.next_plan_id.get()
}

pub fn get_next_subscription_id(&self) -> U256 {
    self.next_subscription_id.get()
}
