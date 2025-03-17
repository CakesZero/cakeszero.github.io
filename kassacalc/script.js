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
let procent = 0.5

saveBtn.addEventListener('click', saveData)
beznalBtn.addEventListener('click', beznalUpdate)
nalBtn.addEventListener('click', nalUpdate)
updateBtn.addEventListener('click', () => (beznalUpdate(), nalUpdate(), update()))
clearBtn.addEventListener('click', clearData)
procentBtn.addEventListener('click', procentToggle)

function beznalUpdate() {
    beznal.value = Number(kassa.value) - Number(nal.value)
}

function nalUpdate() {
    nal.value = Number(kassa.value) - Number(beznal.value)
}

function clearData() {
    if (!confirm('Очистить всю историю?')) return
    localStorage.setItem('data', '[]')
    printData()
}

function procentToggle() {
    if (procent == 0.5) {
        procentBtn.value = '40%'
        procent = 0.4
        localStorage.setItem('procent', 0.4)
    } else {
        procentBtn.value = '50%'
        procent = 0.5
        localStorage.setItem('procent', 0.5)
    }
}

function saveData() {
    let data = JSON.parse(localStorage.getItem('data')) || []
    data.push(currentData)
    localStorage.setItem('data', JSON.stringify(data))
    printData()
}

function deleteKassa(i) {
    const data = JSON.parse(localStorage.getItem('data'))
    if (!data || data.length == 0) return dataScreen.textContent = ''
    data.splice(i, 1)
    localStorage.setItem('data', JSON.stringify(data))
    printData()
}

function printData() {
    const data = JSON.parse(localStorage.getItem('data'))
    if (!data || data.length == 0) return dataScreen.textContent = ''
    const dataText = []
    for (const i in data) {
        const obj = data[i]
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
            `${date.getDate().toString().padStart(2, 0)}.${(date.getMonth() + 1).toString().padStart(2, 0)}`,
            `Касса: ${k}${fkassa}`,
            `Зп: ${zp}${fdolg}`,
            `Банк: ${fbank}`,
            `<button onclick="if(confirm('Удалить кассу?'))deleteKassa(${i})">Удалить</button>`
        ].join('\n'))
    }
    dataScreen.innerHTML = dataText.join('\n\n')
}

function update() {
    const k = Number(kassa.value) || 0
    const bn = Number(beznal.value) || 0
    const n = Number(nal.value) || 0
    const d = Number(dolg.value) || 0
    const Bbn = Number(bankBeznal.value) || 0
    const Bn = Number(bankNal.value)

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

    // if (bn1 < 0) bn1 = 0
    // if (n1 < 0) n1 = 0

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
        `Банк: ${fbank || 0}`
    ].join('\n')
}

window.onload = () => {
    // setInterval(update, 100)
    update()
    printData()
    const p = localStorage.getItem('procent')
    if (p) procent == p
    if (procent == 0.4) procentBtn.value = '40%'
    if (procent == 0.5) procentBtn.value = '50%'
}
