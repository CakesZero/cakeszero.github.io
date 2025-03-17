const s = id => document.getElementById(id)

const kassa = s('kassa')
const beznal = s('beznal')
const nal = s('nal')
const dolg = s('dolg')
const bankBeznal = s('bank-beznal')
const bankNal = s('bank-nal')
const procentBtn = s('procent-btn')
const saveBtn = s('save-btn')
const beznalBtn = s('beznal-btn')
const nalBtn = s('nal-btn')
const updateBtn = s('update-btn')
const clearBtn = s('clear-btn')
const result = s('result')
const dataScreen = s('data-screen')

let currentData = {}
let procent = localStorage.getItem('procent') || 0.5
if (procent == 0.4) procentBtn.value = '40%'

clearBtn.addEventListener('click', () => { localStorage.setItem('data', '[]'); printData()})
procentBtn.addEventListener('click', () => {
    if (procent == 0.5) {
        procentBtn.value = '40%'
        procent = 0.4
        localStorage.setItem('procent', 0.4)
    } else {
        procentBtn.value = '50%'
        procent = 0.5
        localStorage.setItem('procent', 0.5)
    }
})
saveBtn.addEventListener('click', saveData)
beznalBtn.addEventListener('click', beznalUpdate)
nalBtn.addEventListener('click', nalUpdate)
updateBtn.addEventListener('click', update)

function beznalUpdate() { beznal.value = Number(kassa.value) - Number(nal.value) }
function nalUpdate() { nal.value = Number(kassa.value) - Number(beznal.value) }

function saveData() {
    let data = JSON.parse(localStorage.getItem('data')) || []
    data.push(currentData)
    localStorage.setItem('data', JSON.stringify(data))
    printData()
}

function printData() {
    const data = JSON.parse(localStorage.getItem('data'))
    if (!data || data.length == 0) return dataScreen.textContent = ''
    const dataText = []
    for (const obj of data) {
        const k = obj.kassa
        const bn = obj.beznal
        const n = obj.nal
        const d1 = obj.dolg
        const bn1 = obj.bankBeznal
        const n1 = obj.bankNal
        const zp = obj.zp
        const timestamp = obj.timestamp
        const date = new Date(timestamp)
        
        let fkassa = (bn&&n)?` (${bn}бн+${n}н)`:((bn==k)&&!n)?`бн`:(!bn&&(n==k))?`н`:''
        let fdolg = d1?` (${d1}долг)`:''
        let fbank = (bn1&&n1)?`${bn1}бн+${n1}н`:(bn1&&!n1)?`${bn1}бн`:(!bn1&&n1)?`${n1}н`:''
        
        dataText.push([
            `${date.getDate().toString().padStart(2, 0)}.${date.getMonth().toString().padStart(2, 0)}`,
            `Касса: ${k}${fkassa}`,
            `Зп: ${zp}${fdolg}`,
            `Банк: ${fbank}`
        ].join('\n'))
    }
    dataScreen.textContent = dataText.join('\n\n')
}

function update() {
    const k = Number(kassa.value)
    const bn = Number(beznal.value)
    const n = Number(nal.value)
    const d = Number(dolg.value)
    const Bbn = Number(bankBeznal.value)
    const Bn = Number(bankNal.value)
    const procent = procentBtn.value.slice(0, 2)/100

    let zp = Math.floor(k*procent/50)*50
    let bn1 = bn + Bbn
    let n1 = n + Bn
    let d1 = d

    if (zp > n1) {
        // Долг увеличивается
        d1 += zp - n1
        bn1 -= zp - n1
        n1 = 0
    } else {
        // Долг уменьшается или остается без изменений
        n1 -= zp
        if (d1 > n1) {
            d1 -= n1
            n1 = 0
        } else d1 = 0
    }

    let fkassa = (bn&&n)?` (${bn}бн+${n}н)`:((bn==k)&&!n)?`бн`:(!bn&&(n==k))?`н`:''
    let fdolg = d1?` (${d1}долг)`:''
    let fbank = (bn1&&n1)?`${bn1}бн+${n1}н`:(bn1&&!n1)?`${bn1}бн`:(!bn1&&n1)?`${n1}н`:''

    currentData = {
        kassa: k,
        beznal: bn,
        nal: n,
        dolg: d1,
        bankBeznal: bn1,
        bankNal: n1,
        zp: zp,
        timestamp: Date.now()
    }

    result.textContent = [
        `Касса: ${k}${fkassa}`,
        `Зп: ${zp}${fdolg}`,
        `Банк: ${fbank}`
    ].join('\n')

    beznalUpdate(),
    nalUpdate()
}

window.onload = () => {
    // setInterval(update, 100)
    update()
    printData()
}