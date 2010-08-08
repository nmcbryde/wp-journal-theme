<?php

	error_reporting(E_ALL);
	header("Content-type: text/xml");
	header("Cache-Control: no-cache");

    /* Development settings
    $dbhost = 'localhost';
    $dbuser = 'root';
    $dbname = 'blog_development';
    $dbpass = 'lollypops'; //*/

    /* Staging settings
    $dbhost = 'mysql.growthgraph.dreamhosters.com';
    $dbuser = 'growthg_admin';
    $dbname = 'blog_staging';
    $dbpass = '6Gu9m267'; //*/

    //* Production settings
    $dbhost = 'mysql.quailers.com';
    $dbuser = 'growthg_admin';
    $dbpass = '6Gu9m267';
     $dbname = 'nigelblog_production'; //*/


    $conn = mysql_connect($dbhost, $dbuser, $dbpass) or die ('Error connecting to mysql');
    
    mysql_select_db($dbname);

    $query = "SELECT ID, post_title, post_date FROM `wp_posts` WHERE post_status='publish' AND post_type = 'post' ORDER BY post_date ASC;";
    $result = mysql_query($query);


    $timeline = new Timeline();


    /*echo "Year: ".$timeline->getYear(0)->getNumber();

    $timeline->getYear(0)->addMonth(0);

    echo "Month: ".$timeline->getYear(0)->getMonth(0)->getNumber();

    $timeline->getYear(0)->getMonth(0)->addPost(2, "Some Post");

    echo "Day: ".$timeline->getYear(0)->getMonth(0)->getPostDay(0);
    echo "Title: ".$timeline->getYear(0)->getMonth(0)->getPostTitle(0);
    */
        
        
    while($row = mysql_fetch_array($result)){

            $date = date_parse($row['post_date']);
            $row_year = $date['year'];
            $row_month = $date['month'];
            $row_day = $date['day'];

            // $year stores the index of the current year
            $year = $timeline->findYear($row_year);

            if ($year == -1){
                    // year does not exist, create the year
                    $timeline->addYear($row_year);
                    // re-index
                    $year = $timeline->findYear($row_year);
            }


            // $month stores the index of the current month
            $month = $timeline->getYear($year)->findMonth($row_month);
            if ($month = -1){
                    // month does not exist, create the month
                    $timeline->getYear($year)->addMonth($row_month);
                    // re-index
                    $month = $timeline->getYear($year)->findMonth($row_month);
            }
            $timeline->getYear($year)->getMonth($month)->addPost($row_day, $row['post_title'], $row['ID']);


    }

    echo $timeline->toString();



    class Timeline {
            var $years = array();
            var $count = 0;

            function findYear($year_number){
                    for ($i = 0; $i < count($this->years); $i++){

                            if ($this->years[$i]->getNumber() == $year_number){
                                    return $i;
                            }
                    }
                    return -1;
            }

            function addYear($year_number){
                    $this->years[$this->count] = new Year();
                    $this->years[$this->count]->setNumber($year_number);
                    $this->count++;
            }

            function getYear($year){
                    return $this->years[$year];
            }

            function toString() {
                    $string = "";
                    $string .= "<?xml version='1.0'?><response>";
                    for($i = 0; $i < count($this->years); $i++){
                            $string .= "<year><yearnumber>".$this->years[$i]->getNumber()."</yearnumber>";
                            for ($j = 0; $j < count($this->years[$i]->months); $j++){
                                    $string .= "<month><number>".($this->years[$i]->months[$j]->getNumber()-1)."</number>";
                                    for ($k = 0; $k < count($this->years[$i]->months[$j]->posts); $k++){
                                            $string .= "<post>";
                                            $string .= "<name>".$this->years[$i]->months[$j]->getPostTitle($k)."</name>";
                                            $string .= "<day>".$this->years[$i]->months[$j]->getPostDay($k)."</day>";
                                            $string .= "<id>".$this->years[$i]->months[$j]->getPostId($k)."</id>";
                                            $string .= "</post>";
                                    }
                                    $string .="</month>";
                            }
                            $string .= "</year>";
                    }
                    $string.= "</response>";
                    return $string;
            }

    }

    class Year {
            var $months = array();
            var $count = 0;
            var $number;

            function findMonth($month_number){
                    for ($i=0; $i<count($this->months); $i++){
                            if ($this->months[$i]->getNumber() == $month_number){
                                    return $i;
                            }
                    }
                    return -1;
            }

            function setNumber($number){
                    $this->number = $number;

            }

            function getNumber(){
                    return $this->number;

            }
            function getMonth($index){
                    return $this->months[$index];
            }

            function addMonth($number) {
                    $this->months[$this->count] = new Month();
                    $this->months[$this->count]->setNumber($number);
                    $this->count++;
            }

    }

        class Month {
                var $posts = array();
                var $count = 0;
                var $number;
                
                function getPostDay($index) {
                        return $this->posts[$index]['day'];
                }
                
                function getPostTitle($index) {
                        return $this->posts[$index]['title'];
                }
                
                function getPostID($index) {
                        return $this->posts[$index]['id'];
                }
                
                function setNumber($number){
                        $this->number = $number;
                }
                
                function getNumber(){
                        return $this->number;
                }
                
                function addPost($day, $title, $id) {
                        $this->posts[$this->count] = array('day' => $day, 'title' => $title, 'id' => $id);
                        $this->count++;
                }
        }
?>