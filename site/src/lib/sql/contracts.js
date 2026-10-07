// @ts-nocheck
// Result comparator and read-only scope adapted from the supplied v3 workbook.
const LIMITS={query:12000,rows:300,cell:5000,total:150000,columns:40};
function equal(a,b){
 if(a.columns.length!==b.columns.length||a.values.length!==b.values.length)return false;
 const cell=(x,y)=>{
  if(x===y)return true;
  if(typeof x==='bigint'&&typeof y==='number')return Number.isInteger(y)&&x===BigInt(y);
  if(typeof y==='bigint'&&typeof x==='number')return Number.isInteger(x)&&BigInt(x)===y;
  return typeof x==='number'&&typeof y==='number'&&Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x-y)<=1e-8;
 };
 // Tolerance is not transitive: greedily consuming the first compatible row can
 // reject a valid multiset. An augmenting-path match preserves duplicate counts
 // while allowing earlier row assignments to move to another compatible row.
 const candidates=a.values.map(row=>b.values.reduce((matches,other,j)=>{if(row.every((v,k)=>cell(v,other[k])))matches.push(j);return matches;},[]));
 const matched=Array(b.values.length).fill(-1);
 function assign(i,seen){
  for(const j of candidates[i])if(!seen[j]){seen[j]=true;if(matched[j]<0||assign(matched[j],seen)){matched[j]=i;return true;}}
  return false;
 }
 return a.values.every((row,i)=>assign(i,Array(b.values.length).fill(false)));
}
function scope(query){
 if(typeof query!=='string'||query.length>LIMITS.query)throw Error('SQL은 12,000자 이내로 입력하세요.');
 if(query.includes('\0'))throw Error('SQL에 NUL(널) 문자를 넣을 수 없습니다.');
 // This is a scope gate, not a SQL parser. SQLite parses the statement and enforces query_only.
 const stripped=query.replace(/^(?:\s|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)+/g,'').trim();
 if(!/^(SELECT|WITH)\b/i.test(stripped))throw Error('이 실습장은 SELECT 또는 WITH 조회만 실행합니다.');
}

export { LIMITS, equal, scope };
