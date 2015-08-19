function get (context, params) {
  var result = {};
  var sysAxis, sysStart, sysEnd, valAxis, valStart, valEnd;

  var temporal = require("/MarkLogic/temporal.xqy");

  sysAxis = temporal.collectionGetAxis(params.collection, "system");
  valAxis = temporal.collectionGetAxis(params.collection, "valid");

  sysStart = temporal.axisGetStart(sysAxis).toObject().elementReference.localname;
  sysEnd = temporal.axisGetEnd(sysAxis).toObject().elementReference.localname;
  valStart = temporal.axisGetStart(valAxis).toObject().elementReference.localname;
  valEnd = temporal.axisGetEnd(valAxis).toObject().elementReference.localname;

  result.sysStart = sysStart;  
  result.sysEnd = sysEnd;
  result.valStart = valStart;
  result.valEnd = valEnd;
  result.sysAxis = sysAxis;
  result.valAxis = valAxis;

  return result;
}

exports.GET = get;
