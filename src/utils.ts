import * as util from 'util';
import { BigNumber } from "bignumber.js";
const TonWeb = require('tonweb');

const FIFT_LIB =  process.env.FIFT_LIB || '~/src/ton/crypto/fift/lib';
const FIFT_EXE =  process.env.FIFT_EXE || './fift';
const FIFT =  `${FIFT_EXE} -I ${FIFT_LIB} -s`;

const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC'));

const LITE_CLIENT = process.env.LITE_CLIENT_EXE || './lite-client';
export const exec = util.promisify(require('child_process').exec);

const LITE_CLIENT_TIMEOUT = 10000;

interface MapObj {
    [key: string]: string 
  }

const MACROS: MapObj = {
    '$USDC': 'kQA2aQA7gHRQmR0qNnLwPA0LtHOltHbE6YFBj9bk2aQ1Diwr',  // Generation #2 with 18 decimals
    '$KILO': 'kQDanCTHIdPHcqogpptnVAWMBxrAz5YecwLHp1kF3K5f0ZQH',  // Generation #2 with 18 decimals
    '$DEX': 'kQDbdRjJv1OK6889At69TtJImCUE-EkLiTcdDISEBttaHVJY', // V6  sender pays on all messages
    '#DEX_FILE': './addresses/DEX.addr',
}

export function getMacros() { return MACROS };

export function macroReplace (args: string[]): string[] {

    let replacedArgs = args.map( (it:string)=> {
        if(MACROS[it]) {
            return MACROS[it];
        }

        // auto-prefix all .addr files
        if(it.indexOf('.addr') > 0) {
            return `./addresses/${it}`;
        }

        return it;
    })
    return replacedArgs;
}

export async function execFifth(fiftScript: string, args: string[], outBocFile = ''): Promise<string> {
    console.log('args', args)
    try {
        const output = await exec(`${FIFT} ${fiftScript} ${args.join(' ')} ${outBocFile}`);
        console.log(output.stdout);
        return output.stdout;
    } catch(e) {
        console.log(e);
        return '';
    }
}

export async function execRunMethod(contractAddress: string, method: string, args: string[]) {
    
    let typed_args = args.map( (it)=> {
        if(it.length && it != '\n') {
            return ['num', it]
        }
    });
    typed_args = typed_args.filter( it=> { return it ? 1 : 0 });

    try {
        console.log(contractAddress,method, typed_args)
        let rslt = await tonweb.provider.call(contractAddress, method, typed_args);
        console.log(rslt.stack[0][1]);
        return rslt.stack[0][1];
    } catch(e) {
        console.log(e);
        return "NaN";
    }

    console.log(args);
    args = args.map( (it)=> { return it.toString().trim() } );
    args = args.filter( it=> { return it ? 1 : 0 });

    const cmd = `runmethod ${contractAddress} ${method} ${args.join(' ')}`;
    console.log(`lite-client> ${cmd}`);
    try {
        console.log(`${LITE_CLIENT} -C global.config.json -c '${cmd}'`);
        const output = await exec(`${LITE_CLIENT} -C global.config.json -c '${cmd}'`, { timeout: LITE_CLIENT_TIMEOUT});
        const stdout = output.stdout;
        console.log(output);
        const arr = format(stdout.substring(stdout.indexOf('result:') + 7));
        return arr[0];
    } catch(e) {
        return "na";
    }    
}


export async function getAccountBalance(address: string) {
    const rgx = new RegExp('account balance is ([0-9]{0,100})');
    const cmd = `getaccount ${address}`;
    console.log(`running ${cmd}`);
    try {
        const output = await exec(`${LITE_CLIENT} -C global.config.json -c '${cmd}'`, { timeout: LITE_CLIENT_TIMEOUT});
        const stdout = output.stdout;
        let match = rgx.exec(stdout);
        if(match?.length) {
            return match[1];
        }
    } catch(e) {
        return "na";
    }    
}


export function toDecimal(num: number|string, decimal=5) {
    let bn = new BigNumber(num).div(10 ** decimal).toFixed();
    return bn;
}


/* ================================================================= */
/* Utils taken from tondex project */
function format(s: string) { 
    return s.trim()
    .replace(/bits.*?}/g, '')
    .replace(/\[/g, '')
    .replace(/]/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/\{/g, '')
    .replace(/}/g, '')
    .split(' ')
    .filter(s => s.length > 0)
    .map(s => s.startsWith('CSCell') ? parseSlice(s) : s);
}

function parseSlice (s: string)  { return  s.substring('CSCell'.length).substring(4) };