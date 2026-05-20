use marinara_engine_lib::http_server::{self, ServerSecurityConfig};
use marinara_engine_lib::state::AppState;
use std::net::SocketAddr;
use std::path::PathBuf;

#[tokio::main]
async fn main() {
    if let Err(error) = run().await {
        eprintln!("marinara-server failed: {error}");
        std::process::exit(1);
    }
}

async fn run() -> Result<(), Box<dyn std::error::Error>> {
    let addr: SocketAddr = std::env::var("MARINARA_SERVER_ADDR")
        .unwrap_or_else(|_| "127.0.0.1:8787".to_string())
        .parse()?;
    let data_dir = std::env::var("MARINARA_DATA_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("target")
                .join("marinara-server-data")
        });
    let security = ServerSecurityConfig::from_env()?;
    let state = AppState::from_data_dir(data_dir, AppState::server_default_roots())?;
    println!("marinara-server listening on http://{addr}");
    if security.is_auth_enabled() {
        println!("marinara-server auth enabled");
    } else {
        eprintln!(
            "WARNING: marinara-server auth is disabled. Only use this on localhost, a trusted network, or behind an authenticating reverse proxy."
        );
    }
    http_server::serve(state, addr, security).await?;
    Ok(())
}
