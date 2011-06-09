Function executeSqlAndReturnNumRowsAffected(objConn, strSql)
  Dim intNum
  objConn.Execute strSql, intNum
  executeSqlAndReturnNumRowsAffected = intNum
End Function
