<?php
namespace models;
use \timer as timer;

class notifications extends _ {

	private static $instance;
	function __construct() {
		parent::__construct();


	}
	public static function getInstance(){
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function getAll($where = "", $orderby = "", $limit = "", $options = array()) {
		$result = $this->getData($where,$orderby,$limit,$options);
		$result = $this->format($result,$options);
		return $result;

	}
	public function getData($where = "", $orderby = "", $limit = "", $options = array()) {
		$timer = new timer();
		$f3 = \Base::instance();

		if ($where) {
			$where = "WHERE " . $where . "";
		} else {
			$where = " ";
		}

		if ($orderby) {
			$orderby = " ORDER BY " . $orderby;
		}
		if ($limit) {
			$limit = " LIMIT " . $limit;
		}

		$args = "";
		if (isset($options['args'])) $args = $options['args'];

		$ttl = "";
		if (isset($options['ttl'])) $ttl = $options['ttl'];




		$result = $f3->get("DB")->exec("
			 SELECT DISTINCT *
			FROM notifications 
			$where
			GROUP BY ID
			$orderby
			$limit;
		", $args, $ttl
		);

		$return = $result;
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $return;
	}
	static function format($data,$options) {
		$timer = new timer();
		$single = false;
		$f3 = \Base::instance();
		//	test_array($items);
		if (isset($data['ID'])) {
			$single = true;
			$data = array($data);
		}
		//test_array($items);



		$recordIDs = array();

		$i = 1;
		$n = array();
		foreach ($data as $item) {
			$recordIDs[] = $item['ID'];

			$n[] = $item;
		}

		if ($single) $n = $n[0];
		$records = $n;


		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $records;
	}



	function notify_body($notif,$eventID,$extra){



		$template = $this->settings[$notif."|".$eventID];
		$tmpl = new \template($template);
		$tmpl->data = $extra;
		return $tmpl->render_string();





	}
	function notify_subject($notif,$eventID){


		$return = "";
		switch($eventID) {
			case "add_1":
				$return = "Admin added an Appointment";
				break;
			case "add_2":
				$return = "Client added an Appointment";
				break;
			case "edi_1":
				$return = "Admin changed Appointment";
				break;
			case "edi_2":
				$return = "Client changed Appointment";
				break;
		}


		return $return;

	}
	function notify($appointment,$eventID,$extra){

		$notifications = array(
			"not_1"=>array(
				"type"=>"sms",
				"to"=>$appointment["client"]['mobile_number']
			),
			"not_2"=>array(
				"type"=>"email",
				"to"=>$appointment["client"]['email']
			),
			"not_3"=>array(
				"type"=>"sms",
				"to"=>$this->settings['mobile_number']
			),
			"not_4"=>array(
				"type"=>"email",
				"to"=>$this->settings['email']
			)
		);

		foreach ($notifications as $notif=>$notification_settings){
			$template = isset($this->settings[$notif."|".$eventID])?$this->settings[$notif."|".$eventID]:false;
			if ($template=="") $template = false;
			if ($template){
				$log_label = "";
				$log = array(
					"label" => $extra['log_label'],
					"type" => $notification_settings['type']
				);
				$result = false;

				if ($notification_settings)



				switch($notification_settings['type']){
					case "sms":
						if ($notification_settings['to']) {
							$log['body'] = $this->notify_body($notif,$eventID,$extra);
							$result = notifications::getInstance()->_send_sms($notification_settings['to'], $log['body'], $extra);
							if ($result) {
								$log_label = "Notification: " . $notification_settings['to'];
							}
							else {
								$log_label = "Notification FAILED: " . $notification_settings['to'];
							}

						}
						break;
					case "email":
						if ($notification_settings['to']) {
							$log['subject']= $this->notify_subject($notif,$eventID);
							$log['body'] = $this->notify_body($notif,$eventID,$extra);
							$result = notifications::getInstance()->_send_email($notification_settings['to'], $log['body'], $log['subject'], $extra);
							if ($result) {
								$log_label = "Notification: " . $notification_settings['to'];
							}
							else {
								$log_label = "Notification FAILED: " . $notification_settings['to'];
							}
						}
						break;

				}
				if ($log_label){
					$log['log_label'] = $log_label;
					//logs::getInstance()->_log($appointment['ID'], $log_label, $notif."|".$eventID, $log);
					logs::getInstance()->_notify($appointment['ID'], $notif."|".$eventID, $log, $result);
				}


			}





		}
















	}

	function _send_sms($to,$body,$extra=array()){


		//test_array(array("to"=>$to,"body"=>$body,"extra"=>$extra));






	}
	
	function _send_email($to,$subject,$body,$extra=array()){


		//test_array(array("to"=>$to,"subject"=>$subject,"body"=>$body,"extra"=>$extra));






	}


	
}