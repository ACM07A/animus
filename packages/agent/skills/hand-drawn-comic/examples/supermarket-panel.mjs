import fs from "node:fs";
import {execFileSync} from "node:child_process";
import {svgDocument,path,line,ellipse,rect,label,irregularHead,INK} from "../assets/comic-svg.mjs";

const outArg = process.argv.indexOf("--output");
const output = outArg >= 0 ? process.argv[outArg+1] : "supermarket-panel.mp4";
const stillOnly = process.argv.includes("--still");

function shelf(x,y,w,h,rows,seed=1){
  let o=rect(x,y,w,h,"#d9c3a1",7,3);
  for(let r=1;r<rows;r++) o+=line(x,y+h*r/rows,x+w,y+h*r/rows,7);
  const pal=["#e95b3f","#f5c33b","#4da8d8","#7dbb62","#9a69c7","#f08aa7","#ee7f38"];
  for(let r=0;r<rows;r++){
    let yy=y+12+r*h/rows, xx=x+12, i=0;
    while(xx<x+w-35){
      const ww=44+((seed+i*17)%28);
      let hh=62+((seed+i*29)%42);
      hh=Math.min(hh,h/rows-26);
      const c=pal[(seed+i)%pal.length];
      const tilt=((i+seed)%5-2)*1.4;
      o+=`<g transform="rotate(${tilt} ${xx+ww/2} ${yy+hh/2})">${rect(xx,yy,ww,hh,c,4,4)}${ellipse(xx+ww*.55,yy+hh*.5,ww*.18,hh*.12,"#fff7df",2)}</g>`;
      xx+=ww+8;i++;
    }
  }
  return o;
}

let body = "";
body += path("M330 390 L1260 390 L1600 900 L0 900 Z",{fill:"#eee0c7",stroke:"none",sw:0});
body += shelf(0,80,330,760,5,1)+shelf(1270,60,330,780,5,2);
body += rect(520,310,560,150,"#c89e70",6,2);
body += ellipse(650,325,55,25,"#d65045",3)+ellipse(770,320,65,29,"#e18a35",3)+ellipse(915,325,60,25,"#6fa34f",3);
body += rect(690,32,220,105,"#50694e",6,4)+label(800,98,"MARKET",34);

// Cart: perspective, not an icon.
body += path("M410 565 L1045 520 L1132 805 L500 820 Z",{fill:"#dfe5e8",sw:9});
for(let i=0;i<11;i++) body+=line(430+i*57,570,510+i*57,812,3);
for(let j=1;j<6;j++) body+=line(430,565+j*42,1110,577+j*42,3);
body += ellipse(560,840,30,30,"#444",6)+ellipse(1040,832,30,30,"#444",6);
body += path("M650 720 q35 -18 74 0 q-12 48 -68 34 z",{fill:"#f2d03b",sw:5});
body += rect(760,685,82,105,"#b8def7",5,4)+label(801,742,"MILK",18);

// Hero body + large face.
body += line(810,445,820,690,12)+line(815,570,690,520,11)+line(818,575,1025,475,11)+line(820,688,755,820,11)+line(820,688,900,815,11);
body += irregularHead({x:835,y:286,scale:1.1,mood:"worried"});

// Brain cutaway is authored as a scene inside the head.
body += path("M672 158 Q750 110 836 130 Q931 111 1008 161 L1000 220 Q910 196 830 212 Q749 198 676 223 Z",{fill:"#fff2d8",sw:6});
body += path("M745 183 q-34 -22 -16 -50 q-6 -34 27 -39 q18 -31 49 -15 q26 -22 49 1 q35 -13 45 20 q36 4 31 40 q21 27 -5 49 q-2 34 -36 34 q-29 20 -54 -3 q-27 22 -52 -1 q-32 6 -38 -36 z",{fill:"#ef8fa2",sw:6});
body += ellipse(795,145,8,10,"#111",0,"#111")+ellipse(856,143,8,10,"#111",0,"#111")+path("M807 173 q22 18 43 0",{sw:4});
body += path("M775 210 q55 25 102 0 l-4 23 q-52 24 -100 -2 z",{fill:"#e7bd58",sw:4});
["#d44","#e69f2e","#e5ce55","#63a66a","#6aa5d8"].forEach((c,i)=>body+=`<g transform="rotate(${(i-2)*12} 920 180)">${rect(900+i*8,140,26,62,c,3,2)}</g>`);

// Cereal + wallet struggle.
body += `<g transform="rotate(9 1190 530)">${rect(1115,425,180,235,"#e64b36",7,9)}${path("M1116 425 l179 0 l-38 53 l-104 -8 z",{fill:"#f4c430",sw:5})}${ellipse(1205,535,59,53,"#fff2cd",5)}${ellipse(1205,520,29,24,"#8c5b39",4)}${label(1205,615,"CRUNCH",20)}</g>`;
body += rect(1280,625,170,110,"#875b3b",7,15)+path("M1298 626 l115 0 l-22 -34 l-72 9 z",{fill:"#d9e6b6",sw:4});
body += ellipse(1335,670,10,13,"#111",0,"#111")+ellipse(1390,670,10,13,"#111",0,"#111")+path("M1345 708 q20 -30 40 0",{sw:6});
body += path("M1285 675 q-38 -12 -53 -55",{sw:8})+path("M1450 690 q35 -8 50 -48",{sw:8});

const svg=svgDocument({body});
fs.writeFileSync("panel.svg",svg);
execFileSync("rsvg-convert",["-w","1600","-h","900","panel.svg","-o","panel.png"]);
if(stillOnly){
  fs.copyFileSync("panel.png",output);
}else{
  execFileSync("ffmpeg",["-y","-loop","1","-i","panel.png","-t","4","-r","24","-pix_fmt","yuv420p","-c:v","libx264",output],{stdio:"inherit"});
}
