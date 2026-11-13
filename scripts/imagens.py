"""Gera assets/rebeca/ a partir dos PNGs em assets/originais/.

Uso (na raiz do repositório):
    python scripts/imagens.py

O que faz:
- converte cada PNG para WebP com transparência (qualidade 85);
- reduz os rostos (rosto-*.png) para no máximo 160 px, porque o avatar
  é exibido com 56 px;
- monta assets/rebeca/caminhada.webp: um sprite horizontal com os 7
  quadros de caminhada em células de tamanho igual, cada quadro
  centralizado e com os pés na linha de base da célula;
- imprime o tamanho de cada arquivo e as dimensões, para você copiar
  para os atributos width/height do HTML se trocar alguma imagem.
"""

from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGINAIS = RAIZ / "assets" / "originais"
SAIDA = RAIZ / "assets" / "rebeca"
QUALIDADE = 85
ROSTO_MAX = 160
QUADROS_CAMINHADA = [f"caminhada-{i:02d}" for i in range(1, 8)]


def aparar(im: Image.Image) -> Image.Image:
    """Remove margens totalmente transparentes."""
    caixa = im.getbbox()
    return im.crop(caixa) if caixa else im


def salvar(im: Image.Image, nome: str) -> None:
    destino = SAIDA / f"{nome}.webp"
    im.save(destino, "WEBP", quality=QUALIDADE, method=6)
    print(f"{destino.name:28s} {im.width:4d}x{im.height:<4d} {destino.stat().st_size / 1024:6.1f} KB")


def converter_poses() -> None:
    for png in sorted(ORIGINAIS.glob("*.png")):
        nome = png.stem
        if nome in QUADROS_CAMINHADA:
            continue
        im = aparar(Image.open(png).convert("RGBA"))
        if nome.startswith("rosto-"):
            im.thumbnail((ROSTO_MAX, ROSTO_MAX), Image.LANCZOS)
        salvar(im, nome)


def montar_sprite() -> None:
    quadros = [aparar(Image.open(ORIGINAIS / f"{n}.png").convert("RGBA")) for n in QUADROS_CAMINHADA]
    largura = max(q.width for q in quadros)
    altura = max(q.height for q in quadros)
    # célula com largura par facilita o cálculo no CSS
    largura += largura % 2
    folha = Image.new("RGBA", (largura * len(quadros), altura), (0, 0, 0, 0))
    for i, q in enumerate(quadros):
        x = i * largura + (largura - q.width) // 2
        y = altura - q.height  # pés na linha de base
        folha.paste(q, (x, y), q)
    salvar(folha, "caminhada")
    print(f"  célula: {largura}x{altura}, {len(quadros)} quadros")


if __name__ == "__main__":
    SAIDA.mkdir(parents=True, exist_ok=True)
    converter_poses()
    montar_sprite()
