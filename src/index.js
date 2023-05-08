import csvParser from "csv-parser"
import { createReadStream } from "node:fs"
import { randomInt } from "node:crypto"


async function loadCsv(csvFile, separator = ";") {
  const csvStream = createReadStream(csvFile)
    .pipe(csvParser({ separator }))
  const results = []

  for await (const data of csvStream) {
    results.push(data)
  }
  return {
    data: results,
    filterByCity: (city) => {
      return results.filter(item => item.cidade == city)
    },
    sortByfield: (field, order = "ASC") => {
      if (order == "ASC") {
        return results.slice().sort((a, b) => a[field] >= b[field] ? 1 : -1)
      }
      return results.slice().sort((a, b) => a[field] <= b[field] ? 1 : -1)
    },
  }
}

function randomNumbers() {
  return Array(100)
    .fill(0)
    .map(_ => randomInt(1, 1000))
    .filter(_ => _ % 2 == 1)
}

function _financing({amount_due, monthlyPay, interest}) {
  let month = 1
  let initialDue = amount_due
  let due0 = amount_due * interest
  let paid = Math.min(due0, monthlyPay)
  let due1 = due0 - paid
  const installments = [{ month, initialDue, interest, due0, paid, due1 }]

  while (due1 > 0) {
    month += 1
    initialDue = due1
    due0 = due1 * interest
    paid = Math.min(due0, monthlyPay)
    due1 = due0 - paid
    installments.push({ month, initialDue, interest, due0, paid, due1 })
  }

  return installments
}

function financing(amount_due, monthlyPay, interest) {    
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const results = _financing({
    amount_due, 
    monthlyPay, 
    interest: (interest / 100 + 1)
  })
  console.log("installments:",results.length)
  return results.map(e => {
    return `Mês ${e.month}: ${formatter.format(e.initialDue)} + ${e.interest * 100 - 100}% = ${formatter.format(e.due0)} - ${formatter.format(e.paid)} = ${formatter.format(e.due1)}`
  })
}

const csv = await loadCsv("./src/data/data.csv", ";")
console.log(csv.data)
console.log(csv.filterByCity("Blumenau"))
console.log(csv.sortByfield("cidade", "ASC"))
console.log(randomNumbers())
console.log(financing(20000, 1000, 2))

export  {
  loadCsv,
  randomNumbers,
  financing
}