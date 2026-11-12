from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./guardcart_dev.db"
    frontend_origin: str = "http://localhost:5173"
    app_signing_secret: str = "DEVELOPMENT_ONLY_REPLACE_ME"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    paypal_client_id: str = ""
    paypal_client_secret: str = ""
    paypal_base_url: str = "https://api-m.sandbox.paypal.com"
    paypal_return_url: str = "http://localhost:5173/payment-return"
    paypal_cancel_url: str = "http://localhost:5173/approvals"

    @property
    def paypal_configured(self) -> bool:
        return bool(self.paypal_client_id and self.paypal_client_secret)


settings = Settings()
