function kladr_init(mode, cont) {
	var $container = $(document.getElementById(cont));
	var $city = $container.find('[data-kladr-type="city"]'),
		$street = $container.find('[data-kladr-type="street"]'),
		$building = $container.find('[data-kladr-type="building"]'),
		$address = $container.find('[data-kladr-type="address"]');

	$city.kladr({
		type: $.kladr.type.city,
		withParents: true,
		verify: true,
		select: function (obj) {
			vars = {'parentType': $.kladr.type.city, 'parentId': obj.id};
			$street.kladr(vars);
			$address.kladr(vars);
			$building.kladr(vars);
			$('#' + mode + '_' + obj.contentType + '_kladr').val(obj.id);
			finishKladr($city[0]);
		},
		check: function (obj) {
			if (obj) {
				vars = {'parentType': $.kladr.type.city, 'parentId': obj.id};
				$street.kladr(vars);
				$address.kladr(vars);
				$building.kladr(vars);
				$('#' + mode + '_' + obj.contentType + '_kladr').val(obj.id);
			} else {
				$('#' + mode + '_city_kladr').val('');
			}
      finishKladr($city[0]);
		}
	}).change();
	$street.kladr({
		type: $.kladr.type.street,
		parentType: $.kladr.type.city,
		parentId: $('#' + mode + '_city_kladr').val(),
		verify: true,
		select: function (obj) {
			$building.kladr({'parentType': $.kladr.type.street, 'parentId': obj.id});
			$('#' + mode + '_' + obj.contentType + '_kladr').val(obj.id);
      SetZip($(this).closest("form").attr('id'));
      finishKladr($street[0]);
		},
		check: function (obj) {
			if (obj) {
				$building.kladr({'parentType': $.kladr.type.street, 'parentId': obj.id});
				$('#' + mode + '_' + obj.contentType + '_kladr').val(obj.id);
			} else {
				$('#' + mode + '_street_kladr').val('');
			}
      SetZip($(this).closest("form").attr('id'));
      finishKladr($street[0]);
		}
	});
	$building.kladr({
		type: $.kladr.type.building,
		parentType: $.kladr.type.street,
		parentId: $('#' + mode + '_street_kladr').val(),
		verify: false,
		select: function (obj) {
			$('#' + mode + '_' + obj.contentType + '_kladr').val(obj.id);
      SetZip($(this).closest("form").attr('id'));
      finishKladr($building[0]);
		},
		check: function (obj) {
			if (obj) {
				$('#' + mode + '_' + obj.contentType + '_kladr').val(obj.id);
			} else {
				$('#' + mode + '_building_kladr').val('');
			}
      SetZip($(this).closest("form").attr('id'));
      finishKladr($building[0]);
		}
	});
	$address.kladr({
		oneString: true
	});
	var SetZip = function (form) {
		var zip = '';
		var obj = $city.kladr('current');
		if (obj) {
			if (obj.zip) zip = obj.zip;
		}
		var obj = $street.kladr('current');
		if (obj) {
			if (obj.zip) zip = obj.zip;
		}
		var obj = $building.kladr('current');
		if (obj) {
			if (obj.zip) zip = obj.zip;
		}
		// console.log(zip);
    // $('#'+form+' .index').attr("value", zip);
	}
}

function finishKladr(input) {
	if (input.value == 'Совпадений не найдено') {
		input.value = '';
	}
	input.dispatchEvent(new CustomEvent('input', {'bubbles': true}));
}