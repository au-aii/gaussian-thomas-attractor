# 🚀 3D Gaussian Thomas Attractor

カオス理論の **Thomas' cyclically symmetric attractor（トーマス・アトラクター）** を、
TypeScript + Three.js で **3D Gaussian Splatting 風**に描画するアート作品。

**🔗 Live demo → https://gaussian-thomas-attractor.vercel.app/**

![Thomas Attractor](thomas-1.png)

---

## ✨ 見どころ

- **カオスの軌道を手で積分** — 微分方程式をオイラー法で 50万ステップ解いて点群を生成。
- **自作 GLSL シェーダー** — 各点を、ガウス関数 $e^{-r^2}$ で中心が発光し外側がボケる「光の玉」として描画。
- **加算合成 × 密度** — `AdditiveBlending` で点が重なる高密度部ほど強く発光。**軌道がどこに長く留まるか**が光として見える。
- **Bloom** — `EffectComposer` で発光部をさらに幻想的に。
- **シネマティックなカメラ** — 3軸の sin/cos で周回する自動カメラワーク。

> 数式の中身（なぜ動くか）は [MATH.md](./MATH.md)、開発フェーズの記録は [ROADMAP.md](./ROADMAP.md)。

---

## 🛠️ Tech Stack

- **言語:** TypeScript
- **描画:** [Three.js](https://threejs.org/)
- **ビルド/ホスティング:** [Vite](https://vite.dev/) + [Vercel](https://vercel.com/)
- **手法:** カスタム GLSL シェーダー（Gaussian Splat 風）/ Additive Blending / Bloom（EffectComposer）

---

## 🚀 ローカルで動かす

```bash
npm install
npm run dev      # 開発サーバー（http://localhost:5173）
npm run build    # 本番ビルド（dist/ を出力）
```

---

## 🙏 クレジット

- **着想:** [Instagram のリール](https://www.instagram.com/reel/DYsSz2rvWGI)
- **実装:** TypeScript + Three.js でゼロから自作（オイラー法による軌道計算・GLSL シェーダー・カメラワーク）
