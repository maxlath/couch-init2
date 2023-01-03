/* eslint-disable */
export default {
  byExample: {
    map: function (doc) {
      if (doc.example) emit(doc.example, 1)
    },
    reduce: function (keys, values) {
      return values.reduce((a, b) => a + b, 0)
    },
  },
  byExample2: {
    map: `
      const double = num => num * 2

      function (doc) {
        if (doc.example) emit(doc.example, double(1))
      }`,
  },
  byExample3: {
    map: [
      function double (num) { num * 2 },
      function (doc) {
        if (doc.example) emit(doc.example, double(1))
      },
    ],
  },
}
