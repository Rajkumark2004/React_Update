<?php

class com_wiris_util_net_UserAgent {
	public function __construct($userAgent) {
		if(!php_Boot::$skip_constructor) {
		$this->userAgent = $userAgent;
	}}
	public function isIe() {
		return $this->userAgent !== null && _hx_index_of($this->userAgent, "Trident", null) !== -1;
	}
	public $userAgent;
	public function __call($m, $a) {
		if(isset($this->$m) && is_callable($this->$m))
			return call_user_func_array($this->$m, $a);
		else if(isset($this->»dynamics[$m]) && is_callable($this->»dynamics[$m]))
			return call_user_func_array($this->»dynamics[$m], $a);
		else if('toString' == $m)
			return $this->__toString();
		else
			throw new HException('Unable to call «'.$m.'»');
	}
	function __toString() { return 'com.wiris.util.net.UserAgent'; }
}
