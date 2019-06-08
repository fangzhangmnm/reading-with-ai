let Segment=require('segment');
let segment=new Segment();
segment.useDefault();

let fs=require("fs");
let txt=fs.readFileSync('./三体.txt','utf8');
let regSentenceSplit=/[\n。；？！（）\!\.\?\;\'\"\(\)]+/;
//let regNewChapter=/第.*章.*/;
let regNewChapter=/[0-9]+[\.．]/;
//let regNewChapter=/（.+）/;
//let regNewChapter=/\n第[\u4e00-\u9fa5]+回/;
let regNonChinese=/[\u4e00-\u9fa5]+/;
for(let chapter of txt.split(regNewChapter)){
    let sentences=chapter.split(regSentenceSplit).filter(x=>regNonChinese.test(x))
    .map(x=>{return {
        original:x,
        segmented:segment.doSegment(x,{simple:true,stripPunctuation:true,stripStopword: true})
    }}).filter(x=>x.segmented.length>0);
    let words=[];sentences.forEach(x=>x.segmented.forEach(x=>words.push(x)));words=words.filter(x=>regNonChinese.test(x));

    let word2id=new Map(),id2word=[];words.forEach(x=>word2id.has(x)?null:(word2id.set(x,word2id.size),id2word.push(x)));

    let iwords=words.map(x=>word2id.get(x));
    let isentences=sentences.map(x=>x.segmented.map(x=>word2id.get(x)));

    let sentenceGraph=Array(isentences.length);
    for(let i=0;i<isentences.length;++i){
        let row=sentenceGraph[i]=new Map();
        for(let j=0;j<isentences.length;++j){
            row.set(j,similarity(isentences[i],isentences[j]));
        }
    }
    let sentenceRank=textRank(sentenceGraph);
    sentenceGraph=null;
    let sentenceSort=Array.from(Array(sentenceRank.length),(x,i)=>i).sort((i,j)=>sentenceRank[j]-sentenceRank[i]);
    //for(let i=0;i<sentenceSort.length && i<1; ++i)console.log(chapter.length,Math.round(100*sentenceRank[sentenceSort[i]])/100,Math.round(100*sentenceSort[i]/sentenceSort.length),sentences[sentenceSort[i]].original);
    for(let i=0;i<sentenceSort.length && i<1; ++i)console.log(sentences[sentenceSort[i]].original);


}
function textRank(graph){
    let n=graph.length;
    let ws=new Array(n).fill(1),ws_old=new Array(n);
    for(let _i=0;_i<20;++_i){
        let t=ws;ws=ws_old;ws_old=t;
        for(let i=0;i<n;++i){
            let node=graph[i];
            let s=0;
            for(let j of node.keys())
                s+=node.get(j)*ws_old[j];
            s=node.size>0?s/node.size:0;
            ws[i]=0.15+0.85*s;
        }
    }
    return ws;
}
function similarity(si,sj){
    let a=new Set();
    for(let k=0;k<si.length;++k)for(let l=0;l<sj.length;++l)
        if(si[k]==sj[l])a.add(si[k]);
    return a.size/(Math.log(si.length)+Math.log(sj.length)+1);
}
/*
let sentences=txt.split(regSentenceSplit).filter(x=>regNonChinese.test(x))
    .map(x=>{return {
        original:x,
        segmented:segment.doSegment(x,{simple:true,stripPunctuation:true,stripStopword: true})
    }}).filter(x=>x.segmented.length>0);
let words=[];sentences.forEach(x=>x.segmented.forEach(x=>words.push(x)));words=words.filter(x=>regNonChinese.test(x));

let word2id=new Map(),id2word=[];words.forEach(x=>word2id.has(x)?null:(word2id.set(x,word2id.size),id2word.push(x)));
console.log('load txt done');

let iwords=words.map(x=>word2id.get(x));
let coocGraph=id2word.map(x=>new Map());
for(let i=2;i<iwords.length-2;++i){
    let node=coocGraph[iwords[i]];
    for(let j=-2;j<=2;++j)if(j!=0){
        let x=iwords[i+j];
        node.set(x,(node.get(x)||0)+1);
    }
}
console.log('build cocoGraph done');


let wordRank=textRank(coocGraph);
coocGraph=null;
console.log('textRank words done');
let wordSort=Array.from(Array(wordRank.length),(x,i)=>i).sort((i,j)=>wordRank[j]-wordRank[i]);
for(let i=0;i<wordSort.length && i<20; ++i)console.log(id2word[wordSort[i]],wordRank[wordSort[i]]);


let isentences=sentences.map(x=>x.segmented.map(x=>word2id.get(x)));
let sentenceGraph=Array(isentences.length);
function similarity(si,sj){
    let a=new Set();
    for(let k=0;k<si.length;++k)for(let l=0;l<sj.length;++l)
        if(si[k]==sj[l])a.add(si[k]);
    return a.size/(Math.log(si.length)+Math.log(sj.length)+1);
}
for(let i=0;i<isentences.length;++i){
    let row=sentenceGraph[i]=new Map();
    for(let j=0;j<isentences.length;++j){
        row.set(j,similarity(isentences[i],isentences[j]));
    }
}
console.log('build sentenceGraph done');

let sentenceRank=textRank(sentenceGraph);
sentenceGraph=null;
console.log('textRank sentences done');
let sentenceSort=Array.from(Array(sentenceRank.length),(x,i)=>i).sort((i,j)=>sentenceRank[j]-sentenceRank[i]);
for(let i=0;i<sentenceSort.length && i<20; ++i)console.log(sentenceRank[sentenceSort[i]],Math.round(100*sentenceSort[i]/sentenceSort.length),sentences[sentenceSort[i]].original);
*/
