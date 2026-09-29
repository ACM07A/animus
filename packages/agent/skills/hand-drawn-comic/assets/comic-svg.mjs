export const INK = "#171717";

export function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

export function path(d, {
  fill = "none", stroke = INK, sw = 6, extra = ""
} = {}) {
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
}

export function line(x1,y1,x2,y2, sw=6, stroke=INK) {
  const cx=(x1+x2)/2 + (((x1+y1)%7)-3);
  const cy=(y1+y2)/2 + (((x2+y2)%5)-2);
  return path(`M${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, {sw, stroke});
}

export function ellipse(cx,cy,rx,ry, fill="none", sw=6, stroke=INK) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

export function rect(x,y,w,h, fill="none", sw=6, rx=0, stroke=INK) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

export function label(x,y,s,size=26, anchor="middle", rotate=0, weight=700) {
  return `<text x="${x}" y="${y}" font-family="DejaVu Sans,Arial,sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${INK}" transform="rotate(${rotate} ${x} ${y})">${esc(s)}</text>`;
}

export function svgDocument({width=1600,height=900,bg="#f5ecd9",body=""}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="${bg}"/>
    ${body}
  </svg>`;
}

export function irregularHead({x,y,scale=1,fill="#fffaf1",hair="#5b3826",mood="worried"}) {
  const T=`translate(${x} ${y}) scale(${scale})`;
  const mouth = mood === "happy"
    ? path("M-36 92 Q0 122 38 90",{sw:7})
    : mood === "angry"
    ? path("M-42 102 Q0 74 42 104",{sw:7})
    : path("M-42 104 Q0 72 42 104",{sw:7});
  return `<g transform="${T}">
    ${path("M-185 -135 Q-105 -205 20 -185 Q120 -214 187 -134 Q232 -71 214 35 Q198 120 140 166 Q70 218 -26 202 Q-121 217 -181 153 Q-226 101 -221 13 Q-229 -80 -185 -135 Z",{fill,sw:9})}
    ${path("M-177 -126 q24 -70 75 -48 q9 -44 48 -17 q27 -49 62 -8 q38 -42 70 3 q47 -22 70 20 q47 -5 66 43 q-26 -14 -50 -7 q-23 -31 -59 -17 q-20 -31 -54 -8 q-31 -30 -61 -3 q-43 -24 -69 7 q-43 -14 -78 19 z",{fill:hair,sw:8})}
    ${ellipse(-72,18,31,44,"#111",0,"#111")}
    ${ellipse(91,10,35,48,"#111",0,"#111")}
    ${path("M-106 -41 Q-72 -62 -38 -43",{sw:9})}
    ${path("M54 -43 Q95 -67 135 -49",{sw:9})}
    ${mouth}
  </g>`;
}
