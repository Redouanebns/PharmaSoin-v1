$ErrorActionPreference = "Stop"
$root = "c:\Users\HP\3D Objects\pharmaSoin-v1"

function Commit-ToFeatureBranch {
    param(
        [string]$branch,
        [string]$wtPath,
        [string[]]$files,
        [string]$message
    )
    Write-Host "--- Branch: $branch ---" -ForegroundColor Cyan

    git -C $root worktree add $wtPath $branch
    if ($LASTEXITCODE -ne 0) { throw "worktree add failed for $branch" }

    foreach ($file in $files) {
        $src = Join-Path $root ($file -replace "/", "\")
        $dst = Join-Path $wtPath ($file -replace "/", "\")
        $dstDir = Split-Path $dst -Parent
        if (!(Test-Path $dstDir)) {
            New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
        }
        Copy-Item $src $dst -Force
        Write-Host "  Copied: $file"
    }

    foreach ($file in $files) {
        git -C $wtPath add $file
    }
    git -C $wtPath commit -m $message
    if ($LASTEXITCODE -ne 0) { throw "commit failed on $branch" }
    Write-Host "  Committed OK" -ForegroundColor Green

    git -C $root worktree remove $wtPath --force
}

Commit-ToFeatureBranch -branch "feature/create_accuiel" -wtPath "C:\wt-accuiel" -files @(
    "frontEnd/src/features/accueil/Accueil.jsx",
    "frontEnd/src/features/accueil/navbar/Navbar.css",
    "frontEnd/src/features/accueil/navbar/Navbar.jsx"
) -message "ajout frontend feature/create_accuiel"

Commit-ToFeatureBranch -branch "feature/authentification" -wtPath "C:\wt-auth" -files @(
    "frontEnd/src/features/authentification/Authentification.css",
    "frontEnd/src/features/authentification/Authentification.jsx",
    "frontEnd/src/features/authentification/AuthCallback.jsx"
) -message "ajout frontend feature/authentification"

Commit-ToFeatureBranch -branch "feature/dashboard-stats" -wtPath "C:\wt-stats" -files @(
    "frontEnd/src/features/dashboard/statistic/Statistic.css",
    "frontEnd/src/features/dashboard/statistic/Statistic.jsx"
) -message "ajout frontend feature/dashboard-stats"

Commit-ToFeatureBranch -branch "feature/categories-crud" -wtPath "C:\wt-cats" -files @(
    "frontEnd/src/features/dashboard/categorie/CategorieFormModal.css",
    "frontEnd/src/features/dashboard/categorie/CategorieList.css",
    "frontEnd/src/features/dashboard/categorie/CategorieList.jsx"
) -message "ajout frontend feature/categories-crud"

Commit-ToFeatureBranch -branch "feature/medicaments-crud" -wtPath "C:\wt-meds" -files @(
    "frontEnd/src/features/dashboard/medicaments/MedicineFormModal.css",
    "frontEnd/src/features/dashboard/medicaments/MedicineFormModal.jsx",
    "frontEnd/src/features/dashboard/medicaments/MedicineList.css",
    "frontEnd/src/features/dashboard/medicaments/MedicineList.jsx"
) -message "ajout frontend feature/medicaments-crud"

Commit-ToFeatureBranch -branch "feature/commandes-crud" -wtPath "C:\wt-cmds" -files @(
    "frontEnd/src/features/dashboard/orders/CommandeFormModel.css",
    "frontEnd/src/features/dashboard/orders/CommandeFormModel.jsx",
    "frontEnd/src/features/dashboard/orders/CommandesList.jsx"
) -message "ajout frontend feature/commandes-crud"

Commit-ToFeatureBranch -branch "feature/ordonnances-crud" -wtPath "C:\wt-ord" -files @(
    "frontEnd/src/features/dashboard/pharmacy/OrdonnanceFormModal.css",
    "frontEnd/src/features/dashboard/pharmacy/OrdonnanceFormModal.jsx",
    "frontEnd/src/features/dashboard/pharmacy/Ordonnances.css",
    "frontEnd/src/features/dashboard/pharmacy/Ordonnances.jsx"
) -message "ajout frontend feature/ordonnances-crud"

Commit-ToFeatureBranch -branch "feature/fournisseurs-crud" -wtPath "C:\wt-fourn" -files @(
    "frontEnd/src/features/dashboard/suppliers/FournisseurFormModel.css",
    "frontEnd/src/features/dashboard/suppliers/FournisseurFormModel.jsx",
    "frontEnd/src/features/dashboard/suppliers/FournisseurList.jsx"
) -message "ajout frontend feature/fournisseurs-crud"

Commit-ToFeatureBranch -branch "feature/paiement" -wtPath "C:\wt-pai" -files @(
    "frontEnd/src/features/paiement/Paiement.css",
    "frontEnd/src/features/paiement/Paiement.jsx"
) -message "ajout frontend feature/paiement"

Write-Host "--- Merging all feature branches into develop ---" -ForegroundColor Yellow

$branches = @(
    "feature/create_accuiel",
    "feature/authentification",
    "feature/dashboard-stats",
    "feature/categories-crud",
    "feature/medicaments-crud",
    "feature/commandes-crud",
    "feature/ordonnances-crud",
    "feature/fournisseurs-crud",
    "feature/paiement"
)

foreach ($branch in $branches) {
    git -C $root merge --no-ff $branch -m "merge $branch into develop"
    if ($LASTEXITCODE -ne 0) { throw "Merge failed for $branch" }
    Write-Host "  Merged: $branch" -ForegroundColor Green
}

Write-Host "--- Committing shared files on develop ---" -ForegroundColor Magenta

$sharedFiles = @(
    "frontEnd/src/App.jsx",
    "frontEnd/src/index.css",
    "frontEnd/src/services/api.js",
    "frontEnd/src/features/dashboard/Dashboard.css",
    "frontEnd/src/features/dashboard/Dashboard.jsx",
    "frontEnd/src/features/dashboard/sidebar/Sidebar.css",
    "frontEnd/src/features/dashboard/sidebar/Sidebar.jsx",
    "backEnd/composer.json",
    "backEnd/composer.lock",
    "backEnd/routes/api.php"
)

foreach ($file in $sharedFiles) {
    git -C $root add $file
}

git -C $root commit -m "ajout fichiers partages frontend et mise a jour backend"
if ($LASTEXITCODE -ne 0) { throw "Failed to commit shared files" }

Write-Host "DONE - All branches committed and merged into develop." -ForegroundColor Green
