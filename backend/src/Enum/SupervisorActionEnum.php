<?php

declare(strict_types=1);

namespace App\Enum;

enum SupervisorActionEnum: string
{
    case STOP = 'stop';
    case START = 'start';
    case LOG = 'log';
}
