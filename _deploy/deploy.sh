#!/usr/bin/env bash
###############################################################
# Wapps · deploy.sh (v2)
# Despliegue a Hostinger con soporte para SFTP, FTPES y FTP.
#
# Por defecto corre en DRY-RUN (te dice qué subiría sin subir).
# Para subir realmente, agrega --apply.
#
# Uso:
#   bash _deploy/deploy.sh           # dry-run
#   bash _deploy/deploy.sh --apply   # deploy real
#   bash _deploy/deploy.sh --help    # ayuda
###############################################################

set -euo pipefail

RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[0;33m'
BLUE=$'\033[0;34m'
DIM=$'\033[2m'
BOLD=$'\033[1m'
NC=$'\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

MODE="dry-run"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)   MODE="apply"; shift ;;
    --dry-run) MODE="dry-run"; shift ;;
    --help|-h)
      cat << 'HELP'
Wapps · deploy.sh (v2)

Uso:
  bash _deploy/deploy.sh              Dry-run: muestra qué subiría
  bash _deploy/deploy.sh --apply      Deploy real
  bash _deploy/deploy.sh --help       Esta ayuda

Antes de usar:
  1. Copia _deploy/.env.deploy.example a _deploy/.env.deploy
  2. Edita _deploy/.env.deploy con tus credenciales y protocolo
  3. Instala lftp:  sudo apt install lftp
  4. Corre primero en dry-run; luego con --apply

Protocolos soportados (configurable en .env.deploy):
  PROTOCOL="sftp"  → cifrado SSH (recomendado, requiere SFTP en plan)
  PROTOCOL="ftps"  → FTP sobre TLS (cifrado, funciona en planes básicos)
  PROTOCOL="ftp"   → FTP plano (NO recomendado, sin cifrado)
HELP
      exit 0
      ;;
    *)
      echo "Argumento desconocido: $1"
      echo "Usa --help para ver opciones"
      exit 1
      ;;
  esac
done

log_step()    { echo -e "${BLUE}▸${NC} $1"; }
log_ok()      { echo -e "  ${GREEN}✓${NC} $1"; }
log_warn()    { echo -e "  ${YELLOW}⚠${NC} $1"; }
log_error()   { echo -e "  ${RED}✗${NC} $1"; }
log_info()    { echo -e "  ${DIM}$1${NC}"; }
log_section() {
  echo ""
  echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${BLUE}  $1${NC}"
  echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════${NC}"
  echo ""
}

abort() {
  echo ""
  log_error "$1"
  echo ""
  exit 1
}

# ===================================================================
if [[ "$MODE" == "apply" ]]; then
  log_section "Wapps · Deploy a Hostinger · MODO REAL"
else
  log_section "Wapps · Deploy a Hostinger · DRY-RUN (no se sube nada)"
fi
# ===================================================================

# ---------- 1. Dependencias ----------
log_step "Verificando dependencias"
if ! command -v lftp > /dev/null 2>&1; then
  log_error "lftp no está instalado."
  log_info "Instálalo con: sudo apt install lftp"
  exit 1
fi
log_ok "lftp disponible ($(lftp --version 2>&1 | head -1))"

# ---------- 2. Archivos del toolkit ----------
log_step "Verificando archivos del toolkit"
ENV_FILE="$SCRIPT_DIR/.env.deploy"
EXCLUDE_FILE="$SCRIPT_DIR/deploy.exclude"

if [[ ! -f "$ENV_FILE" ]]; then
  log_error "No encuentro $ENV_FILE"
  log_info "Cópialo desde .env.deploy.example:"
  log_info "  cp _deploy/.env.deploy.example _deploy/.env.deploy"
  exit 1
fi
log_ok ".env.deploy presente"

if [[ ! -f "$EXCLUDE_FILE" ]]; then
  abort "Falta $EXCLUDE_FILE"
fi
log_ok "deploy.exclude presente"

# ---------- 3. Cargar configuración ----------
log_step "Cargando configuración"

# shellcheck source=/dev/null
set -a
source "$ENV_FILE"
set +a

# Default de protocolo si no está definido
: "${PROTOCOL:=sftp}"

REQUIRED_VARS=("SFTP_HOST" "SFTP_USER" "SFTP_PASS" "SFTP_PORT" "REMOTE_PATH" "PROTOCOL")
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    abort "Falta la variable $var en .env.deploy"
  fi
done

# Validar protocolo
case "$PROTOCOL" in
  sftp|ftps|ftp) ;;
  *) abort "PROTOCOL inválido: '$PROTOCOL'. Usa sftp, ftps o ftp" ;;
esac

log_ok "Protocolo: $PROTOCOL"
log_ok "Servidor: $SFTP_USER@$SFTP_HOST:$SFTP_PORT"
log_ok "Destino: $REMOTE_PATH"

# Advertencia si elige FTP plano
if [[ "$PROTOCOL" == "ftp" ]]; then
  echo ""
  log_warn "Usando FTP PLANO sin cifrado. Tu contraseña y los archivos"
  log_warn "viajan en texto claro. Considera cambiar a 'ftps' o 'sftp'"
  log_warn "en .env.deploy."
fi

# ---------- 4. Construir comandos lftp según protocolo ----------
# La URL y los settings cambian según el protocolo elegido.
case "$PROTOCOL" in
  sftp)
    URL="sftp://$SFTP_HOST"
    LFTP_PRE='set sftp:auto-confirm yes'
    ;;
  ftps)
    URL="ftp://$SFTP_HOST"
    LFTP_PRE='set ftp:ssl-force true
set ftp:ssl-protect-data true
set ftp:ssl-protect-list true
set ssl:verify-certificate no'
    ;;
  ftp)
    URL="ftp://$SFTP_HOST"
    LFTP_PRE='set ftp:ssl-allow no'
    ;;
esac

# ---------- 5. Probar conexión ----------
log_step "Probando conexión $PROTOCOL"

TEST_OUTPUT=$(lftp -u "$SFTP_USER,$SFTP_PASS" -p "$SFTP_PORT" "$URL" -e "
$LFTP_PRE
set net:max-retries 1
set net:timeout 10
ls $REMOTE_PATH
bye
" 2>&1) || {
  log_error "No pude conectar al servidor"
  log_info "Verifica protocolo, host, puerto y credenciales en .env.deploy"
  echo "$TEST_OUTPUT" | tail -5 | sed 's/^/    /'
  echo ""
  if [[ "$PROTOCOL" == "sftp" ]]; then
    log_info "Si tu plan no tiene SFTP habilitado, prueba PROTOCOL=\"ftps\"."
  fi
  exit 1
}
log_ok "Conexión exitosa"

# ---------- 6. Resumen ----------
log_step "Resumen del deploy"
log_info "Origen local:  $PROJECT_DIR"
log_info "Destino:       $URL:$SFTP_PORT$REMOTE_PATH"

LOCAL_FILES=$(find "$PROJECT_DIR" -type f \
  -not -path "*/\.git/*" \
  -not -path "*/_deploy/*" \
  -not -path "*/nginx/*" \
  -not -path "*/php/*" \
  -not -path "*/postgres/*" \
  -not -name "docker-compose.yml" \
  -not -name "*.md" \
  -not -name "*.zip" \
  | wc -l)
log_info "Archivos candidatos a subir: $LOCAL_FILES (aprox)"

# ---------- 7. Exclusiones ----------
EXCLUDE_ARGS=""
while IFS= read -r pattern; do
  [[ -z "$pattern" || "$pattern" =~ ^[[:space:]]*# ]] && continue
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude-glob $pattern"
done < "$EXCLUDE_FILE"

# ---------- 8. Ejecutar ----------
log_step "Ejecutando $([[ "$MODE" == "apply" ]] && echo "DEPLOY REAL" || echo "DRY-RUN")"
echo ""

if [[ "$MODE" == "apply" ]]; then
  MIRROR_OPTS="--reverse --verbose --parallel=4 --only-newer"
  log_warn "Vas a subir archivos REALMENTE. ¿Continuar? [y/N] "
  read -n 1 -r REPLY
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Cancelado por el usuario"
    exit 0
  fi
else
  MIRROR_OPTS="--reverse --dry-run --verbose --only-newer"
fi

set +e
lftp -u "$SFTP_USER,$SFTP_PASS" -p "$SFTP_PORT" "$URL" << LFTPEOF
$LFTP_PRE
set net:max-retries 3
set net:reconnect-interval-base 3
lcd $PROJECT_DIR
cd $REMOTE_PATH
mirror $MIRROR_OPTS $EXCLUDE_ARGS . .
bye
LFTPEOF
LFTP_EXIT=$?
set -e

echo ""

if [[ $LFTP_EXIT -ne 0 ]]; then
  log_error "lftp terminó con código de error $LFTP_EXIT"
  exit $LFTP_EXIT
fi

# ---------- 9. Final ----------
log_section "$([[ "$MODE" == "apply" ]] && echo "Deploy completado con éxito" || echo "Dry-run completado")"

if [[ "$MODE" == "apply" ]]; then
  cat << EOF
${GREEN}${BOLD}El sitio fue actualizado en Hostinger.${NC}

${BOLD}Verifica abriendo:${NC}
  ${BLUE}https://wapps.servisoftware.com/${NC}

${BOLD}Si algo se ve raro:${NC}
  ${DIM}- Ctrl+Shift+R (recarga forzada sin caché)${NC}
  ${DIM}- Espera 1-2 min si tienes Cloudflare delante${NC}
  ${DIM}- F12 → Console para ver 404 de assets${NC}

EOF
else
  cat << EOF
${YELLOW}${BOLD}Esto fue solo una vista previa. Nada se subió todavía.${NC}

${BOLD}Si los archivos listados arriba se ven bien, ejecuta:${NC}
  ${BLUE}bash _deploy/deploy.sh --apply${NC}

EOF
fi
