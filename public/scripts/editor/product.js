$(() => {
	$("#icon").change(event => {
		let fr = new FileReader();
		fr.addEventListener("load", fre => {
			$("#icon-preview").attr("src", fre.target.result);
		});
		fr.readAsDataURL($("#icon").prop("files")[0]);
	});

	$("#product-form").submit(event => {
		event.preventDefault();
		let api_id = $("#api_id").val();
	});

	$("#update").click(event => {
		event.preventDefault();
		
		let data = {
			api_id: $("#api_id").val(),
			title: $("#title").val(),
			price: $("#price").val(),
			desc: $("#desc").val(),
			icon: $("#icon-preview").attr("src")
		};
		console.log(data);
		$.ajax({
			url: `/shop/api/product/${data.api_id}`, type: "POST", dataType: "json", contentType: "application/json", data: JSON.stringify(data),
			success: () => {window.location = `/shop/${data.api_id}`;},
			error: () => {window.location = `/shop/${data.api_id}`;},
		});
	});

	$("#discard").click(event => {
		
	});
});