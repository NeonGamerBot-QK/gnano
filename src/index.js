const cp = require('child_process')
const { hideBin }  = require('yargs/helpers')
const yargs = require('yargs');
const { mkdtempSync, rmSync } = require('fs');
const argv = yargs(hideBin(process.argv)).argv
function parseUrl(url) {
    if(!url) return {};
    if(url.includes('/blob/')) {
        const [username, reponame, _, branch, ...filePathParts] = url.split('/').slice(3)
        return{
            username,
            reponame,
            branch,
            filePath: filePathParts.join('/'),
            type: 'repo'
        }
    } else if (url.includes('gist.github.com')) {
// todo  = https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#get-a-gist
    }
    return {}

}
function checkForNano() {
return new Promise((res,rej) => {
try {
    const proc = cp.exec('nano')
    proc.stdin.write(Buffer.from('GA==', 'base64'))
    proc.on('exit', code => {
        if(code == 127) rej()
        else res()
    })
    // proc.stdout.on('data', () => {
    // })
} catch (e) {
    rej()
}
})
}

;(async () => {

    try {
        await checkForNano()
        console.log(`Nano Found`)
    } catch(e) {
        console.log(`Nano is not installed!`)
        process.exit(1)
    }
    const gitURL = argv._[0]
    // console.log(gitURL)
const data = await parseUrl(gitURL)
// console.log(data)
 if(!data.type) {
    console.log(`Invalid git URL`)
    process.exit(1)
 }
 console.log(`Creating repo temp...`)
 const tempFolder = mkdtempSync('git')
 cp.execSync(`cd ${tempFolder} && git clone https://github.com/${data.username}/${data.reponame}.git ${tempFolder}`)
    // console.log(argv)
console.log(`Opening file ${data.filePath}..`)
const proc = cp.spawn('nano', [`${tempFolder}/${tempFolder}/${data.filePath}`],{ stdio: 'inherit' })

// cp.spawn('nano', )
proc.on('exit', () => {
    try {
        console.log(`Adding file..`)
    cp.execSync(`cd ${tempFolder}/${tempFolder} && git add ${data.filePath}`)
    console.log(`Commiting file..`)
    cp.execSync(`cd ${tempFolder}/${tempFolder} && git commit -m 'edited file ${data.filePath}' -m 'Edits made with gitnano' `)
    console.log(`Uploading..`)
    cp.execSync(`cd ${tempFolder}/${tempFolder} && git push`)
    } catch(e) {
        console.log(e.message)
    }
    console.log(`Done!`)
    rmSync(tempFolder, { recursive:  true })
})
})()