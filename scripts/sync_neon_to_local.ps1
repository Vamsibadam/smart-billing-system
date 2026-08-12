$ErrorActionPreference = "Stop"

# ============================================================
# POSTGRESQL 18 CLIENT TOOLS
# ============================================================

$PG18_BIN = "C:\Program Files\PostgreSQL\18\bin"

$PG_DUMP = Join-Path $PG18_BIN "pg_dump.exe"
$PG_RESTORE = Join-Path $PG18_BIN "pg_restore.exe"
$PSQL = Join-Path $PG18_BIN "psql.exe"


# ============================================================
# CHECK POSTGRESQL 18 TOOLS
# ============================================================

if (!(Test-Path $PG_DUMP)) {
    throw "PostgreSQL 18 pg_dump.exe not found at $PG_DUMP"
}

if (!(Test-Path $PG_RESTORE)) {
    throw "PostgreSQL 18 pg_restore.exe not found at $PG_RESTORE"
}

if (!(Test-Path $PSQL)) {
    throw "PostgreSQL 18 psql.exe not found at $PSQL"
}


# ============================================================
# HEADER
# ============================================================

Write-Host ""
Write-Host "========================================"
Write-Host "       NEON -> LOCAL DATA SYNC"
Write-Host "========================================"
Write-Host ""


# ============================================================
# LOCAL DATABASE
# ============================================================

$LOCAL_DB_NAME = "smart_billing_db"
$LOCAL_DB_USER = "smartbilling_user"
$LOCAL_DB_HOST = "localhost"
$LOCAL_DB_PORT = "5432"


# ============================================================
# NEON DATABASE
# ============================================================

$NEON_DB_NAME = "neondb"
$NEON_DB_USER = "neondb_owner"
$NEON_DB_HOST = "ep-plain-frog-aotx8ctu.c-2.ap-southeast-1.aws.neon.tech"
$NEON_DB_PORT = "5432"


# ============================================================
# BACKUP DIRECTORY
# ============================================================

$BACKUP_DIR = Join-Path $PSScriptRoot "backups"

if (!(Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}


$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"


$LOCAL_BACKUP = Join-Path `
    $BACKUP_DIR `
    "local_backup_$TIMESTAMP.dump"


$NEON_DUMP = Join-Path `
    $BACKUP_DIR `
    "neon_data_$TIMESTAMP.dump"


# ============================================================
# APPLICATION TABLES
# ============================================================

$APP_TABLES = @(
    "billing_payment",
    "billing_transactionitemingredient",
    "billing_transactionitem",
    "billing_transaction",

    "expenses_expense",
    "expenses_expensecategory",

    "inventory_inventorylog",

    "ingredients_ingredientstocklog",
    "ingredients_ingredient",

    "products_comboitemalternative",
    "products_comboitem",

    "products_recipeingredientalternative",
    "products_recipeingredient",

    "products_product",
    "products_productcategory",

    "settings_app_storesettings"
)


# ============================================================
# SAFETY CHECKS
# ============================================================

if ($LOCAL_DB_HOST -ne "localhost") {
    throw "SAFETY ERROR: Local database host must be localhost."
}


if ($NEON_DB_HOST -eq "PUT_YOUR_NEON_HOST_HERE") {
    throw "ERROR: Neon host has not been configured."
}


Write-Host "PostgreSQL tools:"
Write-Host "  pg_dump    : $PG_DUMP"
Write-Host "  pg_restore : $PG_RESTORE"
Write-Host "  psql       : $PSQL"
Write-Host ""

Write-Host "SOURCE:"
Write-Host "  Neon: $NEON_DB_HOST"
Write-Host ""

Write-Host "DESTINATION:"
Write-Host "  Local: $LOCAL_DB_HOST / $LOCAL_DB_NAME"
Write-Host ""

Write-Host "WARNING:"
Write-Host "This will replace application DATA in your LOCAL database."
Write-Host ""
Write-Host "Your Neon database will NOT be modified."
Write-Host ""


$confirmation = Read-Host "Type SYNC to continue"


if ($confirmation -ne "SYNC") {
    Write-Host ""
    Write-Host "Sync cancelled."
    exit
}


# ============================================================
# 1. BACKUP LOCAL DATABASE
# ============================================================

Write-Host ""
Write-Host "[1/5] Backing up local database..."
Write-Host ""


& $PG_DUMP `
    -h $LOCAL_DB_HOST `
    -p $LOCAL_DB_PORT `
    -U $LOCAL_DB_USER `
    -d $LOCAL_DB_NAME `
    -Fc `
    -f $LOCAL_BACKUP


if ($LASTEXITCODE -ne 0) {
    throw "Local database backup failed."
}


Write-Host ""
Write-Host "Local backup created successfully:"
Write-Host $LOCAL_BACKUP


# ============================================================
# 2. EXPORT NEON DATA ONLY
# ============================================================

Write-Host ""
Write-Host "[2/5] Exporting Neon application data..."
Write-Host ""

Write-Host "You will be asked for your Neon database password."
Write-Host ""


& $PG_DUMP `
    -h $NEON_DB_HOST `
    -p $NEON_DB_PORT `
    -U $NEON_DB_USER `
    -d $NEON_DB_NAME `
    --data-only `
    --format=custom `
    --no-owner `
    --no-privileges `
    -t billing_payment `
    -t billing_transaction `
    -t billing_transactionitem `
    -t billing_transactionitemingredient `
    -t expenses_expense `
    -t expenses_expensecategory `
    -t ingredients_ingredient `
    -t ingredients_ingredientstocklog `
    -t inventory_inventorylog `
    -t products_product `
    -t products_productcategory `
    -t products_recipeingredient `
    -t products_recipeingredientalternative `
    -t products_comboitem `
    -t products_comboitemalternative `
    -t settings_app_storesettings `
    -f $NEON_DUMP


if ($LASTEXITCODE -ne 0) {
    throw "Neon data export failed."
}


Write-Host ""
Write-Host "Neon data export completed successfully:"
Write-Host $NEON_DUMP


# ============================================================
# 3. CLEAR LOCAL APPLICATION DATA
# ============================================================

Write-Host ""
Write-Host "[3/5] Clearing local application data..."
Write-Host ""


foreach ($table in $APP_TABLES) {

    Write-Host "Clearing $table ..."

    $sql = "TRUNCATE TABLE `"$table`" RESTART IDENTITY CASCADE;"


    & $PSQL `
        -h $LOCAL_DB_HOST `
        -p $LOCAL_DB_PORT `
        -U $LOCAL_DB_USER `
        -d $LOCAL_DB_NAME `
        -c $sql


    if ($LASTEXITCODE -ne 0) {
        throw "Failed to clear table: $table"
    }
}


Write-Host ""
Write-Host "Local application data cleared."


# ============================================================
# 4. RESTORE NEON DATA INTO LOCAL
# ============================================================

Write-Host ""
Write-Host "[4/5] Restoring Neon data into local database..."
Write-Host ""


& $PG_RESTORE `
    -h $LOCAL_DB_HOST `
    -p $LOCAL_DB_PORT `
    -U $LOCAL_DB_USER `
    -d $LOCAL_DB_NAME `
    --data-only `
    --no-owner `
    --no-privileges `
    $NEON_DUMP


if ($LASTEXITCODE -ne 0) {
    throw "Neon data restore failed."
}


Write-Host ""
Write-Host "Neon data restored successfully."


# ============================================================
# 5. VERIFY DATA
# ============================================================

Write-Host ""
Write-Host "[5/5] Verifying synced data..."
Write-Host ""


Write-Host "----------------------------------------"
Write-Host "Products"
Write-Host "----------------------------------------"

& $PSQL `
    -h $LOCAL_DB_HOST `
    -p $LOCAL_DB_PORT `
    -U $LOCAL_DB_USER `
    -d $LOCAL_DB_NAME `
    -c "SELECT COUNT(*) AS product_count FROM products_product;"


Write-Host ""
Write-Host "----------------------------------------"
Write-Host "Categories"
Write-Host "----------------------------------------"

& $PSQL `
    -h $LOCAL_DB_HOST `
    -p $LOCAL_DB_PORT `
    -U $LOCAL_DB_USER `
    -d $LOCAL_DB_NAME `
    -c "SELECT COUNT(*) AS category_count FROM products_productcategory;"


Write-Host ""
Write-Host "----------------------------------------"
Write-Host "Ingredients"
Write-Host "----------------------------------------"

& $PSQL `
    -h $LOCAL_DB_HOST `
    -p $LOCAL_DB_PORT `
    -U $LOCAL_DB_USER `
    -d $LOCAL_DB_NAME `
    -c "SELECT COUNT(*) AS ingredient_count FROM ingredients_ingredient;"


Write-Host ""
Write-Host "----------------------------------------"
Write-Host "Recipes"
Write-Host "----------------------------------------"

& $PSQL `
    -h $LOCAL_DB_HOST `
    -p $LOCAL_DB_PORT `
    -U $LOCAL_DB_USER `
    -d $LOCAL_DB_NAME `
    -c "SELECT COUNT(*) AS recipe_count FROM products_recipeingredient;"


Write-Host ""
Write-Host "----------------------------------------"
Write-Host "Transactions"
Write-Host "----------------------------------------"

& $PSQL `
    -h $LOCAL_DB_HOST `
    -p $LOCAL_DB_PORT `
    -U $LOCAL_DB_USER `
    -d $LOCAL_DB_NAME `
    -c "SELECT COUNT(*) AS transaction_count FROM billing_transaction;"


# ============================================================
# COMPLETE
# ============================================================

Write-Host ""
Write-Host "========================================"
Write-Host "       SYNC COMPLETED SUCCESSFULLY"
Write-Host "========================================"
Write-Host ""

Write-Host "Neon was NOT modified."
Write-Host ""

Write-Host "Local backup:"
Write-Host $LOCAL_BACKUP
Write-Host ""

Write-Host "Neon data dump:"
Write-Host $NEON_DUMP
Write-Host ""