function get (context, params) {
	
  var period = cts.period(params.period);

  var result =
    cts.search(
	  cts.andQuery([
	    cts.collectionQuery(params.collection),
	    cts.periodRangeQuery(
	      params.axis, params.operator, period )])
	)

	return result;
}

exports.GET = get;


