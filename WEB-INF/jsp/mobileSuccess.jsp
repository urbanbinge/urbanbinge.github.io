<%@page import="java.util.Enumeration"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%
  Enumeration<String> kayParams = request.getParameterNames();
  String result = "";
  String key = "";
  while (kayParams.hasMoreElements()) {
    key = (String) kayParams.nextElement();
    result += key + "=" + request.getParameter(key) + (kayParams.hasMoreElements() ? "," : "");

  }
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <script type="text/javascript">

    //for Android Success
    function AndroidSuccess(input) {
      //alert(input);
      PayU.onSuccess(input);
    }
    AndroidSuccess("<%= result %>");

  </script>
</head>
<body>

</body>
</html>