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
	});

	$("#update").click(event => {
		let data = $("#product-form").serializeArray();
		$.post(`/shop/api/product/${data.api_id}`, JSON.stringify(data), );
	});

	$("#discard").click(event => {
		
	});
});