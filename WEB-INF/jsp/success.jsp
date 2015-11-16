<%@ page language="java" contentType="text/html; charset=utf-8"
	pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="">
<meta name="author" content="">
<title>Payment Page</title>

<!-- Bootstrap core CSS -->
<link href="${pageContext.request.contextPath}/css/bootstrap.min.css" rel="stylesheet">

<!-- Custom styles for this template -->
<link href="${pageContext.request.contextPath}/css/paymentpage.css" rel="stylesheet">

<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
<!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
<script type="text/javascript">
	function Redirect() {
		window.location = "https://www.urbanbinge.com";
	}
	setTimeout('Redirect()', 5000);
</script>
</head>

<body>
	<div class="container">
		<div class="starter-template">
			<h3>Congratulations... Payment done successfully</h3>
			<hr />
			<p>
				Your ticket has been mailed to provided email-id.<br> Thank
				you for using <a href="https://www.urbanbinge.com">urbanbinge.com</a>
			</p>
		</div>

	</div>
	<!-- /.container -->

	<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
	<script src="${pageContext.request.contextPath}/scripts/lib/paymentpage.js"></script>
	<script type="text/javascript" src="${pageContext.request.contextPath}/scripts/lib/jquery-1.10.2.js"></script>
</body>
</html>
