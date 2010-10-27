# CMS Tag Library / Template Syntax

The CMS templating system is designed to accept standard HTML with the addition of simple tags to denote variables, constants, dynamic includes and so on.

##Tag format
 The parsing engine will accept tags in the format <cms:something option="something" /> (in the case of a self-closing tag) or <cms:if option=""></cms:if> (in the case of a open and close tag).
 The format of this is intended to comply with the syntax of XML/HTML but there are also shorthand forms of common tags.
 
 [year] is short for [date({yyyy})] which produces the four-digit year part of the current system date.
 

