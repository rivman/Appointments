<?php

namespace controllers\admin\data;

use \models as models;

class general extends _ {
	function __construct() {
		parent::__construct();

	}


	function sms_credit() {
		$return = array();

		if ($this->settings['smsportal_username']&&$this->settings['smsportal_password']){
			$return['credits'] = models\_sms::getInstance()->checkCredits();
		}



		return $GLOBALS["output"]['data'] = $return;

	}




}