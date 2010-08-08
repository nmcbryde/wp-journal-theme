<?php
    error_reporting(E_ALL);
	header("Content-type: text");
	header("Cache-Control: no-cache");
    
    $dbhost = 'mysql6.quadrahosting.com.au';
    $dbuser = 'growthg_user';
    $dbpass = 'lollypops';
    
    $conn = mysql_connect($dbhost, $dbuser, $dbpass) or die ('Error connecting to mysql');       
    $dbname = 'growthg_blog';
    mysql_select_db($dbname);
    
    if (isset($_POST['request'])){
        echo " ";
        
        $query = "SELECT post_content FROM `wp_posts` WHERE post_status = 'publish' AND post_type = 'post' AND ID = '".$_POST['request']."' ORDER BY post_date ASC;";
        
        $result = mysql_query($query);
        
        $row = mysql_fetch_object($result);
        echo $row->post_content;
        
        
    } else {
        $query = "SELECT ID, post_title, post_date FROM `wp_posts` WHERE post_status='publish' AND post_type = 'post' ORDER BY post_date ASC;";
        $results = mysql_query($query);
            
        while($row = mysql_fetch_array($results)){
            echo "<post>";
            echo " <id>".$row["ID"]."</id>";
            echo " <title>".$row["post_title"]."</title>";
            echo " <date>".$row["post_date"]."</date>";
            
            echo "</post>";
        }
    }
    
    

?>