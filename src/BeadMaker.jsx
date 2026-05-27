import { useState, useRef, useCallback, useEffect, useMemo } from "react";

// ── Bead Sizes ────────────────────────────────────────────────────────────────
// Per-brand bead size specs (official product names + board peg counts)
// Mini/Perler-Mini: 2.6mm | Midi/Standard: 5mm | Maxi/Biggie: 10mm
// Board pegs: 5mm->29x29, 2.6mm->58x58 (same physical board), 10mm->15x15
const BEAD_SIZES = [
  { mm: 2.6,  label: "Mini",  boardPegs: 58 },
  { mm: 5.0,  label: "Midi",  boardPegs: 29 },
  { mm: 10.0, label: "Maxi",  boardPegs: 15 },
];

// ── Brand Color Palettes ──────────────────────────────────────────────────────
const BRANDS = {
  perler: {
    name: "Perler", flag: "🇺🇸", sub: "美国",
    sizes: [
      { mm: 2.6,  name: "Mini",   boardPegs: 58 },
      { mm: 5.0,  name: "Midi",   boardPegs: 29 },
      { mm: 10.0, name: "Biggie", boardPegs: 15 },
    ],
    colors: [
      { id:"P01", name:"White",        hex:"#F2F0EB", code:"P01 · 80-19001" },
      { id:"P02", name:"Creme",        hex:"#FFF5C8", code:"P02 · 80-19002" },
      { id:"P03", name:"Yellow",       hex:"#FFD700", code:"P03 · 80-19003" },
      { id:"P04", name:"Orange",       hex:"#FF8C00", code:"P04 · 80-19004" },
      { id:"P05", name:"Red",          hex:"#CC2200", code:"P05 · 80-19005" },
      { id:"P06", name:"Bubblegum",    hex:"#FF85C2", code:"P06 · 80-19006" },
      { id:"P07", name:"Purple",       hex:"#7B2FBE", code:"P07 · 80-19007" },
      { id:"P08", name:"Dark Blue",    hex:"#001F6E", code:"P08 · 80-19008" },
      { id:"P09", name:"Light Blue",   hex:"#72BFFF", code:"P09 · 80-19009" },
      { id:"P10", name:"Dark Green",   hex:"#0A5C1E", code:"P10 · 80-19010" },
      { id:"P11", name:"Light Green",  hex:"#78C840", code:"P11 · 80-19011" },
      { id:"P12", name:"Brown",        hex:"#7A3B10", code:"P12 · 80-19012" },
      { id:"P17", name:"Grey",         hex:"#8C8C8C", code:"P17 · 80-19017" },
      { id:"P18", name:"Black",        hex:"#111111", code:"P18 · 80-19018" },
      { id:"P20", name:"Rust",         hex:"#B84A1A", code:"P20 · 80-19020" },
      { id:"P21", name:"Light Brown",  hex:"#C49060", code:"P21 · 80-19021" },
      { id:"P33", name:"Peach",        hex:"#FFCCAA", code:"P33 · 80-19033" },
      { id:"P35", name:"Tan",          hex:"#D2B48C", code:"P35 · 80-19035" },
      { id:"P38", name:"Magenta",      hex:"#CC0077", code:"P38 · 80-19038" },
      { id:"P52", name:"Pastel Blue",  hex:"#AED6F1", code:"P52 · 80-19052" },
      { id:"P57", name:"Cheddar",      hex:"#FFAA33", code:"P57 · 80-19057" },
      { id:"P60", name:"Plum",         hex:"#5C0044", code:"P60 · 80-19060" },
      { id:"P62", name:"Turquoise",    hex:"#00B5AD", code:"P62 · 80-19062" },
      { id:"P80", name:"Bright Green", hex:"#00CC44", code:"P80 · 80-19080" },
    ]
  },
  hama: {
    name: "Hama", flag: "🇩🇰", sub: "丹麦",
    sizes: [
      { mm: 2.6,  name: "Mini",  boardPegs: 58 },
      { mm: 5.0,  name: "Midi",  boardPegs: 29 },
      { mm: 10.0, name: "Maxi",  boardPegs: 15 },
    ],
    colors: [
      { id:"H01", name:"White",        hex:"#F5F5F0", code:"01 · 207-01" },
      { id:"H02", name:"Cream",        hex:"#FFF8DC", code:"02 · 207-02" },
      { id:"H03", name:"Yellow",       hex:"#FFD700", code:"03 · 207-03" },
      { id:"H04", name:"Orange",       hex:"#FF8C00", code:"04 · 207-04" },
      { id:"H05", name:"Red",          hex:"#DD1100", code:"05 · 207-05" },
      { id:"H06", name:"Pink",         hex:"#FF80AA", code:"06 · 207-06" },
      { id:"H07", name:"Parma Violet", hex:"#9966CC", code:"07 · 207-07" },
      { id:"H08", name:"Navy",         hex:"#001177", code:"08 · 207-08" },
      { id:"H09", name:"Sky Blue",     hex:"#55AAFF", code:"09 · 207-09" },
      { id:"H10", name:"Dark Green",   hex:"#005500", code:"10 · 207-10" },
      { id:"H11", name:"Light Green",  hex:"#88CC44", code:"11 · 207-11" },
      { id:"H12", name:"Brown",        hex:"#884422", code:"12 · 207-12" },
      { id:"H13", name:"Beige",        hex:"#D2B48C", code:"13 · 207-13" },
      { id:"H14", name:"Skin",         hex:"#FFCCAA", code:"14 · 207-14" },
      { id:"H15", name:"Burgundy",     hex:"#800020", code:"15 · 207-15" },
      { id:"H16", name:"Fuchsia",      hex:"#CC0077", code:"16 · 207-16" },
      { id:"H17", name:"Grey",         hex:"#999999", code:"17 · 207-17" },
      { id:"H18", name:"Black",        hex:"#222222", code:"18 · 207-18" },
      { id:"H19", name:"Turquoise",    hex:"#00BBAA", code:"19 · 207-19" },
      { id:"H20", name:"Lilac",        hex:"#CC99FF", code:"20 · 207-20" },
      { id:"H22", name:"Olive Green",  hex:"#888800", code:"22 · 207-22" },
      { id:"H24", name:"Cheddar",      hex:"#FFAA33", code:"24 · 207-24" },
      { id:"H26", name:"Mint",         hex:"#AAFFDD", code:"26 · 207-26" },
      { id:"H27", name:"Lemon",        hex:"#FFEE55", code:"27 · 207-27" },
      { id:"H44", name:"Pastel Red",   hex:"#FF8888", code:"44 · 207-44" },
    ]
  },
  mimi: {
    name: "咪咪豆", flag: "🇨🇳", sub: "国产",
    sizes: [
      { mm: 5.0, name: "标准", boardPegs: 29 },
    ],
    colors: [
      { id:"C01", name:"白色",  hex:"#FFFFFF", code:"C01" },
      { id:"C02", name:"象牙白",hex:"#FFFFF0", code:"C02" },
      { id:"C03", name:"柠檬黄",hex:"#FFEE55", code:"C03" },
      { id:"C04", name:"黄色",  hex:"#FFCC00", code:"C04" },
      { id:"C05", name:"橙色",  hex:"#FF8800", code:"C05" },
      { id:"C06", name:"大红",  hex:"#FF2200", code:"C06" },
      { id:"C07", name:"玫红",  hex:"#FF0066", code:"C07" },
      { id:"C08", name:"粉色",  hex:"#FF99BB", code:"C08" },
      { id:"C09", name:"浅紫",  hex:"#CC99FF", code:"C09" },
      { id:"C10", name:"紫色",  hex:"#8800CC", code:"C10" },
      { id:"C11", name:"深蓝",  hex:"#002288", code:"C11" },
      { id:"C12", name:"蓝色",  hex:"#3366FF", code:"C12" },
      { id:"C13", name:"天蓝",  hex:"#66CCFF", code:"C13" },
      { id:"C14", name:"青色",  hex:"#00CCBB", code:"C14" },
      { id:"C15", name:"深绿",  hex:"#006600", code:"C15" },
      { id:"C16", name:"绿色",  hex:"#22AA00", code:"C16" },
      { id:"C17", name:"浅绿",  hex:"#99DD00", code:"C17" },
      { id:"C18", name:"棕色",  hex:"#774400", code:"C18" },
      { id:"C19", name:"卡其",  hex:"#BBAA77", code:"C19" },
      { id:"C20", name:"肤色",  hex:"#FFBB99", code:"C20" },
      { id:"C21", name:"浅灰",  hex:"#CCCCCC", code:"C21" },
      { id:"C22", name:"灰色",  hex:"#888888", code:"C22" },
      { id:"C23", name:"深灰",  hex:"#444444", code:"C23" },
      { id:"C24", name:"黑色",  hex:"#111111", code:"C24" },
    ]
  }
};

// ── Color Math ────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}
function rgbToLab(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  r = r > 0.04045 ? Math.pow((r+0.055)/1.055, 2.4) : r/12.92;
  g = g > 0.04045 ? Math.pow((g+0.055)/1.055, 2.4) : g/12.92;
  b = b > 0.04045 ? Math.pow((b+0.055)/1.055, 2.4) : b/12.92;
  let x = (r*0.4124 + g*0.3576 + b*0.1805)/0.95047;
  let y = (r*0.2126 + g*0.7152 + b*0.0722);
  let z = (r*0.0193 + g*0.1192 + b*0.9505)/1.08883;
  const f = v => v > 0.008856 ? Math.cbrt(v) : 7.787*v + 16/116;
  const [fx,fy,fz] = [f(x),f(y),f(z)];
  return [116*fy-16, 500*(fx-fy), 200*(fy-fz)];
}
function deltaE([l1,a1,b1],[l2,a2,b2]) {
  return Math.sqrt((l1-l2)**2 + (a1-a2)**2 + (b1-b2)**2);
}
function findClosest(r, g, b, palette) {
  const lab = rgbToLab(r,g,b);
  let best = palette[0], bestDist = Infinity;
  for (const c of palette) {
    const d = deltaE(lab, rgbToLab(...hexToRgb(c.hex)));
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return best;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BeadMaker() {
  const [brand,      setBrand]      = useState("perler");
  const [beadMm,     setBeadMm]     = useState(5.0);
  const [targetCm,   setTargetCm]   = useState(20);  // physical cm (longest side)
  const [beadGrid,   setBeadGrid]   = useState(null);
  const [colorStats, setColorStats] = useState([]);
  const [dragging,   setDragging]   = useState(false);
  const [hasImage,   setHasImage]   = useState(false);
  const [processing, setProcessing] = useState(false);
  const [snapToBoard, setSnapToBoard] = useState(true);
  const imgRef = useRef(null);

  // Grid size derived from physical target size
  const effectiveGridSize = Math.round((targetCm * 10) / beadMm);

  // When brand changes, clamp beadMm to supported sizes
  const handleBrandChange = (k) => {
    setBrand(k);
    const supported = BRANDS[k].sizes.find(s => s.mm === beadMm);
    if (!supported) setBeadMm(BRANDS[k].sizes[0].mm);
  };

  const process = useCallback((img, bk, size) => {
    setProcessing(true);
    setTimeout(() => {
      const canvas = document.createElement("canvas");
      const ratio = img.width / img.height;
      const [sw, sh] = ratio >= 1
        ? [size, Math.max(1, Math.round(size / ratio))]
        : [Math.max(1, Math.round(size * ratio)), size];
      canvas.width = sw; canvas.height = sh;
      canvas.getContext("2d").drawImage(img, 0, 0, sw, sh);
      const { data } = canvas.getContext("2d").getImageData(0, 0, sw, sh);
      const palette = BRANDS[bk].colors;
      const grid = [], stats = {};
      for (let y = 0; y < sh; y++) {
        const row = [];
        for (let x = 0; x < sw; x++) {
          const i = (y*sw+x)*4;
          if (data[i+3] < 128) { row.push(null); continue; }
          const c = findClosest(data[i], data[i+1], data[i+2], palette);
          row.push(c);
          if (!stats[c.id]) stats[c.id] = { color: c, count: 0 };
          stats[c.id].count++;
        }
        grid.push(row);
      }
      setBeadGrid({ grid, w: sw, h: sh });
      setColorStats(Object.values(stats).sort((a,b) => b.count - a.count));
      setProcessing(false);
    }, 10);
  }, []);

  useEffect(() => { if (imgRef.current) process(imgRef.current, brand, effectiveGridSize); }, [brand, effectiveGridSize, process]);

  const loadFile = useCallback((file) => {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => { imgRef.current = img; setHasImage(true); process(img, brand, effectiveGridSize); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [brand, effectiveGridSize, process]);

  const CELL = Math.max(4, Math.min(18, Math.floor(500 / Math.max(beadGrid?.w||effectiveGridSize, beadGrid?.h||effectiveGridSize))));
  const totalBeads = colorStats.reduce((s,{count})=>s+count,0);
  // Board boundary info for SVG overlay
  const currentSizeSpec = BRANDS[brand].sizes.find(s => s.mm === beadMm) || BRANDS[brand].sizes[0];
  const svgBoardPegs = currentSizeSpec.boardPegs;

  // Snap: pad grid to nearest boardPegs multiple
  const paddedGrid = useMemo(() => {
    if (!beadGrid || !snapToBoard) return beadGrid;
    const pw = Math.ceil(beadGrid.w / svgBoardPegs) * svgBoardPegs;
    const ph = Math.ceil(beadGrid.h / svgBoardPegs) * svgBoardPegs;
    if (pw === beadGrid.w && ph === beadGrid.h) return beadGrid;
    const grid = beadGrid.grid.map(row => {
      const r = [...row];
      while (r.length < pw) r.push(null);
      return r;
    });
    while (grid.length < ph) grid.push(Array(pw).fill(null));
    return { grid, w: pw, h: ph, origW: beadGrid.w, origH: beadGrid.h };
  }, [beadGrid, snapToBoard, svgBoardPegs]);

  const displayGrid = paddedGrid || beadGrid;

  return (
    <div style={{
      minHeight:"100vh", background:"#0f0e17", color:"#fffffe",
      fontFamily:"'Courier New', monospace", padding:"28px 20px",
    }}>
      {/* ── Header ── */}
      <div style={{textAlign:"center", marginBottom:32}}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:12,
          background:"rgba(255,255,255,0.05)", borderRadius:99,
          padding:"6px 20px", marginBottom:16,
          border:"1px solid rgba(255,255,255,0.1)",
        }}>
          <span style={{fontSize:20}}>📌</span>
          <span style={{fontSize:11, letterSpacing:4, color:"#a7a9be"}}>PIXEL BEAD STUDIO</span>
        </div>
        <h1 style={{
          margin:0, fontSize:"clamp(26px,5vw,42px)", fontWeight:900, letterSpacing:2,
          background:"linear-gradient(120deg,#ff6b6b 0%,#ffd93d 35%,#6bcb77 65%,#4d96ff 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>拼豆图纸生成器</h1>
        <p style={{margin:"8px 0 0", fontSize:12, color:"#56526e", letterSpacing:1}}>
          上传图片 · 选择品牌 · 选择豆径 · 生成图纸
        </p>
      </div>

      <div style={{
        maxWidth:1060, margin:"0 auto",
        display:"grid", gridTemplateColumns:"240px 1fr", gap:20,
      }}>
        {/* ── Left Panel ── */}
        <div>
          {/* Upload */}
          <div
            onClick={() => document.getElementById("_fi").click()}
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);loadFile(e.dataTransfer.files[0])}}
            style={{
              border:`2px dashed ${dragging?"#ffd93d":"#2e2e3a"}`,
              borderRadius:14, padding:"28px 12px", textAlign:"center",
              cursor:"pointer", marginBottom:16, transition:"all .2s",
              background: dragging ? "rgba(255,217,61,.06)" : "rgba(255,255,255,.03)",
            }}
          >
            <div style={{fontSize:28, marginBottom:6}}>🖼️</div>
            <div style={{fontSize:11, color:"#56526e", lineHeight:1.6}}>
              点击或拖拽<br/>图片上传
            </div>
            <input id="_fi" type="file" accept="image/*" style={{display:"none"}}
              onChange={e=>loadFile(e.target.files[0])} />
          </div>

          {/* Brand selector */}
          <Section label="选择品牌">
            {Object.entries(BRANDS).map(([k,b])=>(
              <div key={k} onClick={()=>handleBrandChange(k)} style={{
                padding:"9px 12px", borderRadius:9, cursor:"pointer",
                marginBottom:5, transition:"all .15s", display:"flex", alignItems:"center", gap:8,
                background: brand===k ? "rgba(255,217,61,.12)" : "rgba(255,255,255,.04)",
                border:`1px solid ${brand===k?"#ffd93d":"transparent"}`,
              }}>
                <span style={{fontSize:16}}>{b.flag}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13, fontWeight:700, color: brand===k?"#ffd93d":"#fffffe"}}>{b.name}</div>
                  <div style={{fontSize:10, color:"#56526e"}}>{b.sub}</div>
                </div>
                {brand===k && <span style={{color:"#ffd93d", fontSize:12}}>✓</span>}
              </div>
            ))}
          </Section>

          {/* Bead diameter - per brand */}
          <Section label={`豆径选择·${BRANDS[brand].name}`}>
            <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
              {BRANDS[brand].sizes.map(({mm, name})=>{
                const active = beadMm === mm;
                return (
                  <div key={mm}
                    onClick={()=> setBeadMm(mm)}
                    style={{
                      flex:1, minWidth:55, padding:"9px 6px", borderRadius:9,
                      textAlign:"center", cursor:"pointer", transition:"all .15s",
                      background: active ? "rgba(255,217,61,.15)" : "rgba(255,255,255,.04)",
                      border:`1px solid ${active?"#ffd93d":"#2e2e3a"}`,
                    }}>
                    <div style={{
                      fontSize:14, fontWeight:900,
                      color: active ? "#ffd93d" : "#fffffe",
                    }}>{mm}mm</div>
                    <div style={{
                      fontSize:10, fontWeight:600,
                      color: active?"#ffd93d":"#a7a9be", marginTop:2,
                    }}>{name}</div>
                  </div>
                );
              })}
            </div>
            {/* Visual bead size comparison */}
            <div style={{
              display:"flex", alignItems:"flex-end", gap:6, marginTop:12,
              padding:"10px 12px", background:"rgba(255,255,255,.03)", borderRadius:8,
            }}>
              {BRANDS[brand].sizes.map(({mm, name})=>{
                const px = Math.max(6, mm * 3.2);
                const active = beadMm === mm;
                return (
                  <div key={mm} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:4, flex:1}}>
                    <div style={{
                      width:px, height:px, borderRadius:"50%",
                      background: active ? "#ffd93d" : "#2e2e3a",
                      border: `1px solid ${active?"#ffd93d":"#444"}`,
                      transition:"all .2s", flexShrink:0,
                    }}/>
                    <span style={{fontSize:8, color: active?"#ffd93d":"#444", textAlign:"center"}}>{name}</span>
                    <span style={{fontSize:8, color: active?"#ffd93d88":"#333"}}>{mm}mm</span>
                  </div>
                );
              })}
              <div style={{fontSize:8, color:"#333", paddingBottom:14, paddingLeft:4, flexShrink:0}}>实际比例</div>
            </div>
          </Section>

          {/* Physical size */}
          <Section label="成品大小">
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#56526e",marginBottom:4}}>
              <span>成品最长边</span>
              <span style={{color:"#ffd93d",fontWeight:700}}>{targetCm} cm</span>
            </div>
            <input type="range" min={5} max={60} value={targetCm}
              onChange={e=>setTargetCm(+e.target.value)}
              style={{width:"100%", accentColor:"#ffd93d", cursor:"pointer"}} />
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#333",marginTop:2}}>
              <span>5cm</span><span>60cm</span>
            </div>
            <div style={{
              marginTop:8, fontSize:10, color:"#56526e",
              background:"rgba(255,255,255,.03)", borderRadius:6, padding:"5px 8px",
            }}>
              所需颗粒: <span style={{color:"#ffd93d",fontWeight:700}}>
                {effectiveGridSize} × {Math.round(effectiveGridSize*(beadGrid?.h/beadGrid?.w||0.75))} 颗
              </span>
            </div>
            {/* Compare across sizes */}
            <div style={{marginTop:8}}>
              {BRANDS[brand].sizes.map(({mm,name})=>{
                const n = Math.round((targetCm*10)/mm);
                const isActive = mm === beadMm;
                return (
                  <div key={mm} style={{
                    display:"flex", alignItems:"center", gap:6, marginBottom:4,
                    opacity: isActive ? 1 : 0.5,
                  }}>
                    <div style={{
                      width:Math.max(6,mm*2.5), height:Math.max(6,mm*2.5),
                      borderRadius:"50%", flexShrink:0,
                      background: isActive ? "#ffd93d" : "#444",
                    }}/>
                    <span style={{fontSize:9, color: isActive?"#fffffe":"#56526e", width:32, flexShrink:0}}>{name}</span>
                    <div style={{flex:1, height:4, background:"#1e1e2e", borderRadius:99, overflow:"hidden"}}>
                      <div style={{
                        height:"100%", background: isActive?"#ffd93d":"#444",
                        width:`${Math.min(100,(n/120)*100)}%`, borderRadius:99,
                      }}/>
                    </div>
                    <span style={{fontSize:9, color: isActive?"#ffd93d":"#444", width:40, textAlign:"right", flexShrink:0}}>
                      {n}×{Math.round(n*(beadGrid?.h/beadGrid?.w||0.75))}
                    </span>
                  </div>
                );
              })}
              <div style={{fontSize:9,color:"#333",marginTop:2,textAlign:"right"}}>颗 (宽×高)</div>
            </div>
          </Section>

          {/* Palette dots */}
          <Section label="色板">
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {BRANDS[brand].colors.map(c=>(
                <div key={c.id} title={`${c.name}  ${c.code}`} style={{
                  width:16, height:16, borderRadius:"50%",
                  background:c.hex, border:"1px solid rgba(255,255,255,.12)",
                  flexShrink:0,
                }} />
              ))}
            </div>
          </Section>
        </div>

        {/* ── Right Panel ── */}
        <div>
          {!hasImage ? (
            <div style={{
              border:"1px solid #1e1e2e", borderRadius:16,
              height:420, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:12, color:"#2e2e3a",
            }}>
              <div style={{fontSize:48}}>🧩</div>
              <div style={{fontSize:13}}>请上传图片开始生成</div>
            </div>
          ) : processing ? (
            <div style={{
              border:"1px solid #1e1e2e", borderRadius:16,
              height:420, display:"flex", alignItems:"center",
              justifyContent:"center", color:"#56526e", fontSize:13,
            }}>
              ⚙️ &nbsp;处理中…
            </div>
          ) : beadGrid ? (
            <>
              {/* Bead grid */}
              <div style={{
                display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:8,
              }}>
                <span style={{fontSize:11, color:"#56526e"}}>
                  {snapToBoard && displayGrid?.origW
                    ? `已补齐到 ${displayGrid.w}×${displayGrid.h}（+${displayGrid.w - displayGrid.origW}×+${displayGrid.h - displayGrid.origH}空格）`
                    : `${beadGrid?.w}×${beadGrid?.h} 格`
                  }
                </span>
                <div
                  onClick={()=>setSnapToBoard(v=>!v)}
                  style={{
                    display:"flex", alignItems:"center", gap:6,
                    cursor:"pointer", fontSize:11, padding:"4px 10px",
                    borderRadius:7, border:"1px solid",
                    borderColor: snapToBoard ? "#ffd93d" : "#2e2e3a",
                    background: snapToBoard ? "rgba(255,217,61,.12)" : "rgba(255,255,255,.04)",
                    color: snapToBoard ? "#ffd93d" : "#56526e",
                    transition:"all .2s",
                  }}>
                  <span style={{
                    width:10, height:10, borderRadius:2,
                    background: snapToBoard ? "#ffd93d" : "transparent",
                    border: "1px solid currentColor",
                    display:"inline-block", transition:"all .2s",
                  }}/>
                  对齐底板边界
                </div>
              </div>
              <div style={{
                background:"rgba(255,255,255,.03)", borderRadius:16,
                padding:16, overflow:"auto", marginBottom:16,
                border:"1px solid #1e1e2e",
              }}>
                <svg width={displayGrid.w*CELL} height={displayGrid.h*CELL} style={{display:"block"}}>
                  {/* Padding area (empty board space) */}
                  {snapToBoard && displayGrid.origW && (
                    <>
                      <rect
                        x={displayGrid.origW*CELL} y={0}
                        width={(displayGrid.w - displayGrid.origW)*CELL}
                        height={displayGrid.h*CELL}
                        fill="rgba(255,217,61,.04)"
                        stroke="none"
                      />
                      <rect
                        x={0} y={displayGrid.origH*CELL}
                        width={displayGrid.w*CELL}
                        height={(displayGrid.h - displayGrid.origH)*CELL}
                        fill="rgba(255,217,61,.04)"
                        stroke="none"
                      />
                    </>
                  )}

                  {/* Fine grid lines */}
                  {Array.from({length:displayGrid.h+1},(_,i)=>(
                    <line key={`h${i}`} x1={0} y1={i*CELL} x2={displayGrid.w*CELL} y2={i*CELL}
                      stroke="rgba(255,255,255,.06)" strokeWidth={.4}/>
                  ))}
                  {Array.from({length:displayGrid.w+1},(_,i)=>(
                    <line key={`v${i}`} x1={i*CELL} y1={0} x2={i*CELL} y2={displayGrid.h*CELL}
                      stroke="rgba(255,255,255,.06)" strokeWidth={.4}/>
                  ))}

                  {/* Beads */}
                  {displayGrid.grid.map((row,y)=>row.map((cell,x)=>
                    cell ? (
                      <circle key={`${x}-${y}`}
                        cx={x*CELL+CELL/2} cy={y*CELL+CELL/2} r={CELL/2-.8}
                        fill={cell.hex} stroke="rgba(0,0,0,.35)" strokeWidth={.6}
                      />
                    ) : null
                  ))}

                  {/* Board boundary lines — vertical */}
                  {Array.from({length: Math.ceil(displayGrid.w / svgBoardPegs) + 1}, (_,i) => {
                    const x = i * svgBoardPegs * CELL;
                    if (x > displayGrid.w * CELL + 1) return null;
                    return (
                      <line key={`bv${i}`}
                        x1={x} y1={0} x2={x} y2={displayGrid.h*CELL}
                        stroke="#ffd93d" strokeWidth={Math.max(1.5, CELL*0.2)}
                        strokeOpacity={0.85}
                      />
                    );
                  })}

                  {/* Board boundary lines — horizontal */}
                  {Array.from({length: Math.ceil(displayGrid.h / svgBoardPegs) + 1}, (_,i) => {
                    const y = i * svgBoardPegs * CELL;
                    if (y > displayGrid.h * CELL + 1) return null;
                    return (
                      <line key={`bh${i}`}
                        x1={0} y1={y} x2={displayGrid.w*CELL} y2={y}
                        stroke="#ffd93d" strokeWidth={Math.max(1.5, CELL*0.2)}
                        strokeOpacity={0.85}
                      />
                    );
                  })}

                  {/* Board number labels */}
                  {Array.from({length: Math.ceil(displayGrid.h / svgBoardPegs)}, (_,row) =>
                    Array.from({length: Math.ceil(displayGrid.w / svgBoardPegs)}, (_,col) => {
                      const lx = col * svgBoardPegs * CELL + 4;
                      const ly = row * svgBoardPegs * CELL + Math.max(10, CELL);
                      const num = row * Math.ceil(displayGrid.w / svgBoardPegs) + col + 1;
                      return (
                        <text key={`bl${row}-${col}`}
                          x={lx} y={ly}
                          fill="#ffd93d" fontSize={Math.max(8, CELL)}
                          fontWeight="bold" opacity={0.85}
                          fontFamily="monospace"
                        >#{num}</text>
                      );
                    })
                  )}
                </svg>
              </div>

              {/* Stats panel */}
              <StatsPanel colorStats={colorStats} totalBeads={totalBeads} beadGrid={beadGrid}
                brand={BRANDS[brand]} beadMm={beadMm} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Stats Panel ───────────────────────────────────────────────────────────────
function StatsPanel({ colorStats, totalBeads, beadGrid, brand, beadMm }) {
  const [tab, setTab] = useState("bar");
  if (!colorStats.length) return null;

  const top5       = colorStats.slice(0, 5);
  const maxCount   = colorStats[0]?.count || 1;
  const colorCount = colorStats.length;
  const unusedCount = brand.colors.length - colorCount;
  const dominantColor = colorStats[0];
  const avgPerColor = Math.round(totalBeads / colorCount);
  const gridW = beadGrid?.w || 0;
  const gridH = beadGrid?.h || 0;

  // Physical size calculation
  const physW = (gridW * beadMm / 10).toFixed(1);  // cm
  const physH = (gridH * beadMm / 10).toFixed(1);  // cm
  const physWmm = (gridW * beadMm).toFixed(0);      // mm
  const physHmm = (gridH * beadMm).toFixed(0);      // mm

  // Board calculation - use brand-specific size info
  const sizeInfo = brand.sizes.find(s => s.mm === beadMm);
  const boardPegs = sizeInfo?.boardPegs || 29;
  const boardCmSide = (boardPegs * beadMm / 10).toFixed(1);
  const boardsW = Math.ceil(gridW / boardPegs);
  const boardsH = Math.ceil(gridH / boardPegs);
  const boardsTotal = boardsW * boardsH;

  // Donut
  const DONUT_R = 44, DONUT_CX = 60, DONUT_CY = 60, STROKE = 18;
  const circumference = 2 * Math.PI * DONUT_R;
  let offset = 0;
  const top5Total = top5.reduce((s,{count})=>s+count,0);
  const otherCount = totalBeads - top5Total;
  const segments = [...top5.map(({color,count})=>({color:color.hex,label:color.name,count})),
    otherCount > 0 ? {color:"#333",label:"其他",count:otherCount} : null].filter(Boolean);
  const donutSegments = segments.map(seg => {
    const frac = seg.count / totalBeads;
    const dash = frac * circumference;
    const d = { ...seg, dash, offset, frac };
    offset += dash;
    return d;
  });

  return (
    <div style={{
      background:"rgba(255,255,255,.03)", borderRadius:16,
      border:"1px solid #1e1e2e", overflow:"hidden",
    }}>
      {/* ── Summary cards ── */}
      <div style={{
        display:"grid", gridTemplateColumns:"repeat(6,1fr)",
        borderBottom:"1px solid #1e1e2e",
      }}>
        {[
          { emoji:"🔢", label:"总颗粒数",  value: totalBeads.toLocaleString(), sub: null },
          { emoji:"🎨", label:"使用色数",  value: `${colorCount} 色`, sub: `未用 ${unusedCount}` },
          { emoji:"📐", label:"格数",       value: `${gridW}×${gridH}`, sub: "颗 × 颗" },
          { emoji:"📏", label:"实物宽×高", value: `${physW}×${physH}`, sub: `cm（${physWmm}×${physHmm}mm）` },
          { emoji:"⚪", label:"豆径",       value: `${beadMm}mm`,
            sub: brand.sizes.find(s=>s.mm===beadMm)?.name },
          { emoji:"🧩", label:"需要底板",  value: `${boardsTotal} 块`,
            sub: `${boardsW}×${boardsH}排列·${boardPegs}×${boardPegs}孔/块` },
        ].map(({emoji,label,value,sub},i)=>(
          <div key={label} style={{
            padding:"12px 8px", textAlign:"center",
            borderRight: i<5 ? "1px solid #1e1e2e" : "none",
          }}>
            <div style={{fontSize:16, marginBottom:3}}>{emoji}</div>
            <div style={{fontSize:14, fontWeight:900, color:"#ffd93d", letterSpacing:.5, lineHeight:1.2}}>{value}</div>
            <div style={{fontSize:9, color:"#56526e", marginTop:3, lineHeight:1.4}}>{label}</div>
            {sub && <div style={{fontSize:9, color:"#444", marginTop:1}}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* ── Size visualizer ── */}
      <div style={{
        padding:"10px 18px", borderBottom:"1px solid #1e1e2e",
        display:"flex", alignItems:"center", gap:12,
        background:"rgba(255,255,255,.01)",
      }}>
        <span style={{fontSize:10, color:"#444", flexShrink:0}}>实物尺寸参考</span>
        {/* A4 paper = 21×29.7cm for reference */}
        <div style={{flex:1, position:"relative", height:32}}>
          {/* A4 reference bar */}
          <div style={{
            position:"absolute", left:0, top:6, height:20,
            width:"100%", background:"rgba(255,255,255,.05)",
            borderRadius:3, border:"1px solid #2e2e3a",
          }}>
            <span style={{fontSize:8, color:"#333", position:"absolute", right:4, top:"50%",
              transform:"translateY(-50%)"}}>A4 21cm</span>
          </div>
          {/* Actual width bar */}
          <div style={{
            position:"absolute", left:0, top:6, height:20,
            width:`${Math.min(100, (+physW / 21) * 100)}%`,
            background:"linear-gradient(90deg,#ffd93d88,#ffd93d44)",
            borderRadius:3, border:"1px solid #ffd93d66",
            transition:"width .4s ease",
            display:"flex", alignItems:"center", paddingLeft:6,
            overflow:"hidden",
          }}>
            <span style={{fontSize:9, color:"#ffd93d", whiteSpace:"nowrap"}}>{physW}cm</span>
          </div>
        </div>
        <div style={{
          fontSize:11, color:"#ffd93d", fontWeight:700, flexShrink:0,
          background:"rgba(255,217,61,.1)", padding:"3px 10px", borderRadius:6,
          border:"1px solid rgba(255,217,61,.2)",
        }}>
          {physW} × {physH} cm
        </div>
      </div>

      {/* ── Board layout visualizer ── */}
      <div style={{
        padding:"10px 18px", borderBottom:"1px solid #1e1e2e",
        background:"rgba(255,255,255,.01)",
      }}>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <span style={{fontSize:10, color:"#444", flexShrink:0, width:60}}>底板布局</span>
          <div style={{display:"flex", flexWrap:"wrap", gap:3}}>
            {Array.from({length: boardsH}, (_, row) =>
              Array.from({length: boardsW}, (_, col) => {
                // check if this board is needed (not fully empty)
                const x0 = col * boardPegs, y0 = row * boardPegs;
                const needed = beadGrid?.grid?.slice(y0, y0+boardPegs)
                  .some(r => r?.slice(x0, x0+boardPegs).some(c => c));
                return (
                  <div key={`${row}-${col}`} style={{
                    width: 22, height: 22, borderRadius: 3,
                    background: needed ? "rgba(255,217,61,.2)" : "rgba(255,255,255,.04)",
                    border: `1px solid ${needed ? "#ffd93d66" : "#2e2e3a"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize: 8, color: needed ? "#ffd93d" : "#333",
                  }}>{needed ? "✓" : "·"}</div>
                );
              })
            )}
          </div>
          <div style={{fontSize:10, color:"#56526e", flex:1}}>
            {boardsTotal}块底板（{boardsW}×{boardsH}） &middot; 每块 {boardPegs}×{boardPegs} 孔 · {boardCmSide}×{boardCmSide}cm
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display:"flex", borderBottom:"1px solid #1e1e2e",
        padding:"0 16px",
      }}>
        {[["bar","📊 用量排行"],["list","📋 完整清单"],["donut","🍩 占比分布"]].map(([key,label])=>(
          <div key={key} onClick={()=>setTab(key)} style={{
            padding:"10px 14px", fontSize:11, cursor:"pointer",
            color: tab===key ? "#ffd93d" : "#56526e",
            borderBottom: tab===key ? "2px solid #ffd93d" : "2px solid transparent",
            transition:"all .15s", marginBottom:-1,
          }}>{label}</div>
        ))}
        <div style={{flex:1}}/>
        <div style={{display:"flex", alignItems:"center", gap:6, fontSize:10, color:"#444"}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#6bcb77",display:"inline-block"}}/>
          已用 {colorCount}
          <span style={{width:8,height:8,borderRadius:"50%",background:"#2e2e3a",
            border:"1px solid #444",display:"inline-block",marginLeft:6}}/>
          未用 {unusedCount}
        </div>
      </div>

      {/* ── Bar chart ── */}
      {tab === "bar" && (
        <div style={{padding:"16px 20px"}}>
          <div style={{fontSize:11,color:"#56526e",marginBottom:12,letterSpacing:1}}>
            TOP {Math.min(10, colorStats.length)} 用量排行
          </div>
          {colorStats.slice(0,10).map(({color,count},i)=>{
            const pct = (count/totalBeads*100).toFixed(1);
            const barW = (count/maxCount*100).toFixed(1);
            return (
              <div key={color.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                <div style={{width:18,textAlign:"right",fontSize:10,color:"#444",flexShrink:0}}>#{i+1}</div>
                <div style={{
                  width:12,height:12,borderRadius:"50%",flexShrink:0,
                  background:color.hex,border:"1px solid rgba(255,255,255,.15)",
                }}/>
                <div style={{width:110,flexShrink:0,overflow:"hidden"}}>
                  <div style={{fontSize:10,color:"#a7a9be",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{color.name}</div>
                  <div style={{fontSize:9,color:"#ffd93d",opacity:.7,letterSpacing:.5}}>{color.code}</div>
                </div>
                <div style={{flex:1,height:10,background:"#1e1e2e",borderRadius:99,overflow:"hidden"}}>
                  <div style={{
                    height:"100%",borderRadius:99,
                    background:`linear-gradient(90deg,${color.hex}dd,${color.hex}88)`,
                    width:`${barW}%`,transition:"width .4s ease",
                  }}/>
                </div>
                <div style={{width:90,textAlign:"right",fontSize:10,color:"#ffd93d",flexShrink:0}}>
                  {count.toLocaleString()} <span style={{color:"#444"}}>({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Full list ── */}
      {tab === "list" && (
        <div style={{padding:"12px 16px", maxHeight:280, overflowY:"auto"}}>
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(160px,1fr))",
            gap:6,
          }}>
            {colorStats.map(({color,count})=>{
              const pct = (count/totalBeads*100).toFixed(1);
              return (
                <div key={color.id} style={{
                  display:"flex",alignItems:"center",gap:7,
                  background:"rgba(255,255,255,.04)",borderRadius:8,padding:"6px 9px",
                }}>
                  <div style={{
                    width:14,height:14,borderRadius:"50%",flexShrink:0,
                    background:color.hex,border:"1px solid rgba(255,255,255,.2)",
                  }}/>
                  <div style={{flex:1,overflow:"hidden"}}>
                    <div style={{fontSize:10,color:"#a7a9be",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{color.name}</div>
                    <div style={{fontSize:9,color:"#ffd93d",opacity:.7}}>{color.code}</div>
                    <div style={{fontSize:9,color:"#444"}}>{pct}%</div>
                  </div>
                  <div style={{fontSize:11,color:"#ffd93d",fontWeight:700,flexShrink:0}}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Donut ── */}
      {tab === "donut" && (
        <div style={{padding:"20px",display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>
          <svg width={120} height={120} style={{flexShrink:0}}>
            {donutSegments.map((seg,i)=>(
              <circle key={i}
                cx={DONUT_CX} cy={DONUT_CY} r={DONUT_R}
                fill="none" stroke={seg.color} strokeWidth={STROKE}
                strokeDasharray={`${seg.dash} ${circumference-seg.dash}`}
                strokeDashoffset={-seg.offset}
                transform={`rotate(-90 ${DONUT_CX} ${DONUT_CY})`}
                style={{opacity:.9}}
              />
            ))}
            <text x={DONUT_CX} y={DONUT_CY-6} textAnchor="middle"
              fill="#ffd93d" fontSize={14} fontWeight={900}>{colorCount}</text>
            <text x={DONUT_CX} y={DONUT_CY+10} textAnchor="middle"
              fill="#56526e" fontSize={9}>色</text>
          </svg>
          <div style={{flex:1,minWidth:160}}>
            {segments.map((seg,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                <div style={{width:10,height:10,borderRadius:2,flexShrink:0,
                  background:seg.color,border:"1px solid rgba(255,255,255,.1)"}}/>
                <span style={{fontSize:10,color:"#a7a9be",flex:1,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{seg.label}</span>
                <span style={{fontSize:10,color:"#ffd93d",flexShrink:0}}>
                  {(seg.frac*100).toFixed(1)}%
                </span>
              </div>
            ))}
            {dominantColor && (
              <div style={{
                marginTop:12,padding:"8px 10px",
                background:"rgba(255,217,61,.07)",borderRadius:8,
                border:"1px solid rgba(255,217,61,.15)",
              }}>
                <div style={{fontSize:9,color:"#56526e",marginBottom:3}}>主色</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:12,height:12,borderRadius:"50%",
                    background:dominantColor.color.hex,border:"1px solid rgba(255,255,255,.2)"}}/>
                  <span style={{fontSize:11,color:"#ffd93d",fontWeight:700}}>
                    {dominantColor.color.name}
                  </span>
                  <span style={{fontSize:9,color:"#888",display:"block",marginTop:1}}>
                    {dominantColor.color.code}
                  </span>
                  <span style={{fontSize:10,color:"#56526e",marginLeft:"auto"}}>
                    {(dominantColor.count/totalBeads*100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({label, children}) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{fontSize:10,color:"#444",letterSpacing:2,marginBottom:8,textTransform:"uppercase"}}>{label}</div>
      {children}
    </div>
  );
}
