function get(context, params) {

  var ltInfinity = xs.dateTime("9999-12-31T23:59:59.99Z").subtract(xs.yearMonthDuration('P1Y'));

  var result = {};

  result.sysStart = cts.values(
    cts.elementReference(xs.QName('sysStart')),
    null,
    ["ascending","limit=1"],
    cts.collectionQuery(params.collection)
  );

  result.sysEnd = cts.values (
    cts.elementReference(xs.QName('sysEnd')),
    ltInfinity,
    ["descending","limit=1"],
    cts.collectionQuery(params.collection)
  );

  result.valStart = cts.values(
    cts.elementReference(xs.QName('valStart')),
    null,
    ["ascending","limit=1"],
    cts.collectionQuery(params.collection)
  );

  result.valEnd = cts.values (
    cts.elementReference(xs.QName('valEnd')),
    ltInfinity,
    ["descending","limit=1"],
    cts.collectionQuery(params.collection)
  );
  return result;

}

exports.GET = get;
