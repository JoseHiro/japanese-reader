# Yomu — 日本語リーダー

Satori Reader ライクな日本語学習リーダー（Web）。テキストを貼り付けると
[kuromoji.js](https://github.com/takuyaa/kuromoji.js) が単語ごとに解析し、
振り仮名の表示/非表示、単語クリックで読み・品詞・辞書リンク、文末ボタンで
読み上げ（Web Speech API）ができる。すべてブラウザ内で完結する静的サイト。

## 開発

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm install` 後、`prebuild`/`copy-dict` が kuromoji の辞書ファイルと
ブラウザ用ビルドを `public/dict` と `public/vendor` にコピーする。

## ビルド

```bash
npm run build    # dist/ に出力
npm run preview  # ビルド結果を確認
```

## デプロイ

`main` への push で GitHub Actions（`.github/workflows/deploy.yml`）が
自動ビルドし、`dist` を `gh-pages` ブランチに公開する（GitHub Pages は
`gh-pages` ブランチを配信）。Vite の `base` は `./`（相対）なので
プロジェクトページ（`/<repo>/`）でそのまま動く。

## Phase 0 のスコープ

- 形態素解析による自動分割・振り仮名付与
- 振り仮名トグル
- 単語ポップアップ（読み・基本形・品詞・Jisho リンク）
- 文単位の読み上げ

次の段階: JMdict による英語の語義、文単位の英訳（Claude API）、単語帳・SRS。
詳細は [DESIGN.md](DESIGN.md)。
